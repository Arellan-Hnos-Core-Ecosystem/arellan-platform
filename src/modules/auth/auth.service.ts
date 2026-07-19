import { Injectable, UnauthorizedException, NotFoundException, Logger, HttpException, HttpStatus, ForbiddenException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../../common/prisma/prisma.service"
import { RedisService } from "../../common/redis/redis.service"
import { SecretCipherService } from "../../common/crypto/secret-cipher.service"
import { RealtimeGateway } from "../../common/gateway/realtime.gateway"
import * as bcrypt from "bcryptjs"
import { createHash } from "crypto"
import { authenticator } from "otplib"
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto } from "./dto/auth.dto"
import { UserRole, Account } from "@prisma/client"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  mfaVerified: boolean
  // FUN-18: para cuentas CLIENT, id del registro Client enlazado
  // (Client.accountId). La autorización de recursos del portal compara SIEMPRE
  // contra este claim del JWT, nunca contra IDs enviados por el frontend.
  clientId?: string | null
}

const PRIVILEGED_ROLES: UserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE]
const MFA_PENDING_PREFIX = "mfa:pending:"
const MFA_PENDING_TTL_SECONDS = 600

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly secretCipher: SecretCipherService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  // SEC-06: los refresh tokens se persisten como hash SHA-256 (no en claro).
  // Una copia de la BD no permite reutilizar un refresh token: el valor en
  // claro sólo existe en el cliente; la búsqueda/revocación compara por hash.
  private static hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex")
  }

  async login(dto: LoginDto, ip: string, userAgent?: string) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    })

    if (!account || account.status === "TERMINATED") {
      throw new UnauthorizedException("Credenciales invalidas")
    }

    if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
      throw new HttpException(
        { statusCode: 429, message: "Demasiados intentos fallidos. Cuenta bloqueada 15 minutos.", code: "ACCOUNT_LOCKED" },
        HttpStatus.TOO_MANY_REQUESTS
      )
    }

    const isValid = await bcrypt.compare(dto.password, account.passwordHash)
    if (!isValid) {
      const failedAttempts = account.failedAttempts + 1
      const lockedUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined
      await this.prisma.account.update({
        where: { id: account.id },
        data: { failedAttempts, lockedUntil },
      })
      throw new UnauthorizedException("Credenciales invalidas")
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    })

    if (account.mfaEnabled) {
      const sessionToken = this.jwt.sign(
        { sub: account.id, mfaPending: true, role: account.role },
        { secret: this.config.get("JWT_ACCESS_SECRET"), expiresIn: "5m" }
      )
      return {
        mfaPending: true,
        sessionToken,
        message: "Ingresa el codigo de autenticacion de tu app 2FA",
      }
    }

    // SEC-05-bis: los roles privilegiados sin MFA enrolada reciben tokens con
    // mfaVerified=false — el MfaEnforcementInterceptor global les bloquea todo
    // salvo /auth/* hasta completar el enrolamiento (mfa/generate + mfa/confirm).
    const result = await this.generateTokens(account, false, ip, userAgent)
    if (PRIVILEGED_ROLES.includes(account.role) && !account.mfaEnabled) {
      return {
        ...result,
        mfaEnrollmentRequired: true,
        message: "Tu rol requiere MFA. Configura tu autenticador antes de operar.",
      }
    }
    return result
  }

  async mechanicLogin(pin: string, ip: string, userAgent?: string) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { pin },
      include: { account: true },
    })

    if (!personnel || !personnel.account) {
      throw new UnauthorizedException("PIN invalido")
    }

    const account = personnel.account

    if (account.status !== "ACTIVE") {
      throw new UnauthorizedException("Cuenta inactiva. Contacte al administrador.")
    }

    const allowedRoles: UserRole[] = [UserRole.MECHANIC, UserRole.TRAINEE]
    if (!allowedRoles.includes(account.role)) {
      throw new UnauthorizedException("Este PIN no corresponde a un perfil de taller")
    }

    await this.prisma.account.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    })

    this.logger.log(`Mechanic login: ${account.name} (${account.role}) from ${ip}`)

    return this.generateTokens(account, false, ip, userAgent)
  }

  async verifyMfa(dto: MfaVerifyDto) {
    let payload: any
    try {
      payload = this.jwt.verify(dto.sessionToken, {
        secret: this.config.get("JWT_ACCESS_SECRET"),
      })
    } catch {
      throw new UnauthorizedException("Session de MFA expirada. Inicia sesion nuevamente.")
    }

    if (!payload.mfaPending) {
      throw new UnauthorizedException("Session invalida para MFA")
    }

    const account = await this.prisma.account.findUnique({
      where: { id: payload.sub },
    })

    if (!account || !account.mfaSecret) {
      throw new UnauthorizedException("MFA no configurada")
    }

    // SEC-06: el secreto TOTP se guarda cifrado (AES-256-GCM); se descifra
    // sólo en memoria para la verificación.
    const isValid = authenticator.verify({
      token: dto.token,
      secret: this.secretCipher.decrypt(account.mfaSecret),
    })

    if (!isValid) {
      throw new UnauthorizedException("Codigo MFA invalido")
    }

    this.logger.log(`MFA verified for ${account.email}`)
    return this.generateTokens(account, true)
  }

  // SEC-25: antes, este método sobrescribía `mfaSecret` y ponía
  // `mfaEnabled=false` con cualquier access token válido — un token robado (aun
  // con mfaVerified=false) permitía DESACTIVAR el MFA de la víctima sin
  // verificar ningún factor. Ahora: (a) si la cuenta ya tiene MFA activa, la
  // regeneración exige un token con mfaVerified=true (sesión que completó
  // TOTP); (b) el secreto nuevo queda PENDIENTE en Redis (cifrado, TTL 10 min)
  // y el secreto/estado actual NO se toca hasta confirmar con un código válido.
  async generateMfaSecret(user: Pick<AuthUser, "id" | "mfaVerified">) {
    const account = await this.prisma.account.findUnique({ where: { id: user.id } })

    if (!account) {
      throw new NotFoundException("Usuario no encontrado")
    }

    if (account.mfaEnabled && user.mfaVerified !== true) {
      throw new ForbiddenException({
        message: "Para regenerar el MFA debes iniciar sesion completando tu TOTP actual",
        code: "MFA_REQUIRED",
      })
    }

    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(
      account.email,
      this.config.get("MFA_ISSUER", "ArellanHnos"),
      secret,
    )

    await this.redis.set(
      `${MFA_PENDING_PREFIX}${account.id}`,
      this.secretCipher.encrypt(secret),
      MFA_PENDING_TTL_SECONDS,
    )

    await this.prisma.auditLog.create({
      data: {
        userId: account.id,
        userName: account.name,
        role: account.role,
        action: "MFA_ENROLL_STARTED",
        entity: "Account",
        entityId: account.id,
        severity: "INFO",
        ipAddress: "system",
      },
    })

    return { secret, otpauth }
  }

  async confirmMfaSetup(userId: string, token: string) {
    const account = await this.prisma.account.findUnique({ where: { id: userId } })
    if (!account) throw new NotFoundException("Usuario no encontrado")

    const pendingEncrypted = await this.redis.get(`${MFA_PENDING_PREFIX}${userId}`)
    if (!pendingEncrypted) {
      throw new NotFoundException("No hay un enrolamiento MFA pendiente. Genera un secreto primero.")
    }

    const pendingSecret = this.secretCipher.decrypt(pendingEncrypted)
    const isValid = authenticator.verify({ token, secret: pendingSecret })
    if (!isValid) {
      throw new UnauthorizedException("Codigo MFA invalido")
    }

    await this.prisma.account.update({
      where: { id: userId },
      data: { mfaSecret: this.secretCipher.encrypt(pendingSecret), mfaEnabled: true },
    })
    await this.redis.del(`${MFA_PENDING_PREFIX}${userId}`)

    // SEC-05-bis: al cambiar el estado MFA se revocan las sesiones previas —
    // fueron emitidas sin (o con otro) segundo factor.
    await this.revokeAllUserSessions(userId)

    await this.prisma.auditLog.create({
      data: {
        userId,
        userName: account.name,
        role: account.role,
        action: "MFA_ENABLED",
        entity: "Account",
        entityId: userId,
        severity: "WARNING",
        ipAddress: "system",
      },
    })

    return { message: "MFA activada correctamente. Vuelve a iniciar sesion con tu codigo TOTP." }
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.account.findUnique({ where: { email: dto.email } })
    if (existing) {
      throw new UnauthorizedException("El correo ya esta registrado")
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
      },
    })

    this.logger.log(`New account: ${account.email} (${account.role})`)
    return { id: account.id, email: account.email, name: account.name, role: account.role }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const account = await this.prisma.account.findUnique({ where: { id: userId } })
    if (!account) throw new NotFoundException("Usuario no encontrado")

    const isValid = await bcrypt.compare(dto.currentPassword, account.passwordHash)
    if (!isValid) throw new UnauthorizedException("Contrasena actual incorrecta")

    // SEC-15: la nueva contraseña debe diferir de la actual.
    if (await bcrypt.compare(dto.newPassword, account.passwordHash)) {
      throw new UnauthorizedException("La nueva contrasena debe ser distinta a la actual")
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.account.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // SEC-19: invalidar TODAS las sesiones tras cambiar la contraseña (CWE-613).
    // Antes, los refresh tokens y sesiones Redis previas seguían vigentes: un
    // atacante con una sesión robada conservaba acceso pese al cambio de clave.
    await this.revokeAllUserSessions(userId)

    await this.prisma.auditLog.create({
      data: {
        userId,
        userName: account.name,
        role: account.role,
        action: "PASSWORD_CHANGED",
        entity: "Account",
        entityId: userId,
        severity: "WARNING",
        ipAddress: "system",
      },
    })

    return { message: "Contrasena actualizada correctamente. Vuelve a iniciar sesion." }
  }

  async refreshToken(refreshToken: string) {
    let payload: any
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: this.config.get("JWT_REFRESH_SECRET"),
      })
    } catch {
      throw new UnauthorizedException("Refresh token invalido o expirado")
    }

    const tokenHash = AuthService.hashToken(refreshToken)
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { account: true },
    })

    if (!stored) {
      throw new UnauthorizedException("Refresh token revocado")
    }

    // SEC-06: detección de reutilización. Un refresh token ya rotado que vuelve
    // a presentarse indica robo/replay de la familia de tokens → se revocan
    // TODAS las sesiones del usuario y se registra alerta de seguridad.
    if (stored.revoked) {
      await this.revokeAllUserSessions(stored.accountId)
      await this.prisma.auditLog.create({
        data: {
          userId: stored.accountId,
          userName: stored.account.name,
          role: stored.account.role,
          action: "REFRESH_TOKEN_REUSE_DETECTED",
          entity: "RefreshToken",
          entityId: stored.id,
          severity: "SECURITY_ALERT",
          ipAddress: stored.ipAddress ?? "unknown",
        },
      })
      throw new UnauthorizedException("Refresh token revocado")
    }

    if (new Date() > stored.expiresAt) {
      throw new UnauthorizedException("Refresh token revocado")
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    })

    // FUN-19: el refresh conserva el estado MFA de la sesión original (claim
    // firmado en el refresh JWT). Antes se re-emitía con mfaVerified=false,
    // degradando a los privilegiados que SÍ completaron TOTP: tras 15 min todas
    // las rutas MFA-protegidas les devolvían 403.
    const mfaVerified = payload.mfaVerified === true
    return this.generateTokens(stored.account, mfaVerified, stored.ipAddress || undefined, stored.deviceInfo || undefined)
  }

  async logout(refreshToken: string) {
    const tokenHash = AuthService.hashToken(refreshToken)
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    })

    if (stored) {
      await this.invalidateSession(stored.accountId, stored.token)
    }

    await this.prisma.refreshToken.updateMany({
      where: { token: tokenHash },
      data: { revoked: true },
    })
    return { message: "Sesion cerrada correctamente" }
  }

  async forceLogoutUser(targetUserId: string, performerId: string) {
    await this.revokeAllUserSessions(targetUserId)

    this.logger.log(`Force logout of user ${targetUserId} by ${performerId}`)
    return { message: "Sesion cerrada forzosamente" }
  }

  async getProfile(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, mfaEnabled: true, status: true, createdAt: true },
    })
    if (!account) throw new NotFoundException("Usuario no encontrado")
    return account
  }

  async storeSession(accountId: string, tokenHash: string) {
    await this.redis.set(`session:${accountId}:${tokenHash}`, tokenHash, 604800)
  }

  async invalidateSession(accountId: string, tokenHash: string) {
    await this.redis.del(`session:${accountId}:${tokenHash}`)
  }

  async invalidateAllSessions(accountId: string) {
    const keys = await this.scanKeys(`session:${accountId}:*`)
    if (keys.length > 0) {
      await this.redis.client.del(...keys)
    }
  }

  // Revocación integral de un usuario: refresh tokens (BD) + sesiones Redis +
  // sockets WebSocket vivos (SEC-24: un socket conectado sobrevivía a la
  // revocación de la sesión que lo autenticó).
  private async revokeAllUserSessions(accountId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { accountId, revoked: false },
      data: { revoked: true },
    })
    await this.invalidateAllSessions(accountId)
    this.realtimeGateway.disconnectUser(accountId)
  }

  async getActiveSessions(accountId: string): Promise<string[]> {
    const keys = await this.scanKeys(`session:${accountId}:*`)
    if (keys.length === 0) return []
    const hashes = await this.redis.client.mget(...keys)
    return hashes.filter((h): h is string => h !== null)
  }

  async logoutAll(accountId: string) {
    const account = await this.prisma.account.findUnique({ where: { id: accountId } })
    if (!account) throw new NotFoundException("Usuario no encontrado")

    await this.revokeAllUserSessions(accountId)

    await this.prisma.auditLog.create({
      data: {
        userId: accountId,
        userName: account.name,
        role: account.role,
        action: "LOGOUT_ALL",
        ipAddress: "system",
        severity: "INFO",
      },
    })

    this.logger.log(`All sessions invalidated for ${account.email}`)
    return { message: "Todas las sesiones cerradas correctamente" }
  }

  async getSessions(userId: string) {
    // SEC-06: no se devuelve la columna token (ahora hash del refresh token);
    // la revocación individual usa el id de la sesión.
    return this.prisma.refreshToken.findMany({
      where: { accountId: userId, revoked: false },
      select: {
        id: true,
        expiresAt: true,
        deviceInfo: true,
        ipAddress: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async revokeSession(sessionId: string, userId: string) {
    const session = await this.prisma.refreshToken.findFirst({
      where: { id: sessionId, accountId: userId, revoked: false },
    })
    if (!session) throw new NotFoundException("Sesion no encontrada")

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revoked: true },
    })

    await this.invalidateSession(userId, session.token)

    return { message: "Sesion revocada correctamente" }
  }

  async getUserWithPersonnel(userId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: userId },
      include: { personnelProfile: true },
    })
    if (!account) throw new NotFoundException("Usuario no encontrado")
    return account
  }

  // Verificación TOTP reutilizable (login MFA, override de caja). Descifra el
  // secreto en memoria; nunca lo expone.
  async verifyTotpForAccount(accountId: string, token: string): Promise<boolean> {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { mfaEnabled: true, mfaSecret: true },
    })
    if (!account?.mfaEnabled || !account.mfaSecret) return false
    return authenticator.verify({ token, secret: this.secretCipher.decrypt(account.mfaSecret) })
  }

  private async generateTokens(account: Account, mfaVerified = false, ip?: string, userAgent?: string) {
    // SEC-05: MFA es obligatorio para OWNER/ADMIN/FINANCE. Antes, mfaVerified
    // era true cuando la cuenta NO tenía MFA activada (`!account.mfaEnabled`),
    // lo que permitía a un privilegiado sin MFA pasar el MfaRequiredGuard. Ahora
    // los roles privilegiados sólo quedan verificados si completaron el TOTP;
    // los no privilegiados (MECHANIC/TRAINEE/CLIENT) no usan MFA.
    const requiresMfa = PRIVILEGED_ROLES.includes(account.role)
    const effectiveMfaVerified = mfaVerified || !requiresMfa

    // FUN-18: identidad CLIENT resuelta server-side (relación Client.accountId).
    let clientId: string | null = null
    if (account.role === UserRole.CLIENT) {
      const client = await this.prisma.client.findUnique({
        where: { accountId: account.id },
        select: { id: true },
      })
      clientId = client?.id ?? null
    }

    const payload: AuthUser = {
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name,
      mfaVerified: effectiveMfaVerified,
      ...(account.role === UserRole.CLIENT ? { clientId } : {}),
    }

    const accessToken = this.jwt.sign(payload as unknown as Record<string, unknown>, {
      secret: this.config.get("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_TTL", "15m"),
    })

    // FUN-19: el refresh JWT lleva el estado MFA firmado para que la rotación
    // no degrade sesiones que completaron TOTP.
    const refreshToken = this.jwt.sign(
      { sub: account.id, mfaVerified: effectiveMfaVerified },
      { secret: this.config.get("JWT_REFRESH_SECRET"), expiresIn: this.config.get("JWT_REFRESH_TTL", "7d") }
    )

    const tokenHash = AuthService.hashToken(refreshToken)
    await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        accountId: account.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        deviceInfo: userAgent,
      },
    })

    await this.storeSession(account.id, tokenHash)

    this.logger.log(`Session created for ${account.email}`)

    return {
      accessToken,
      refreshToken,
      user: { id: account.id, email: account.email, name: account.name, role: account.role, mfaEnabled: account.mfaEnabled },
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = []
    let cursor = "0"
    do {
      const [nextCursor, found] = await this.redis.client.scan(cursor, "MATCH", pattern, "COUNT", 100)
      cursor = nextCursor
      keys.push(...found)
    } while (cursor !== "0")
    return keys
  }
}
