import { Injectable, UnauthorizedException, NotFoundException, Logger } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { PrismaService } from "../../common/prisma/prisma.service"
import { RedisService } from "../../common/redis/redis.service"
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
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async login(dto: LoginDto, ip: string, userAgent?: string) {
    const account = await this.prisma.account.findUnique({
      where: { email: dto.email },
    })

    if (!account || account.status === "TERMINATED") {
      throw new UnauthorizedException("Credenciales invalidas")
    }

    if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
      throw new UnauthorizedException("Cuenta bloqueada temporalmente")
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

    const isValid = authenticator.verify({
      token: dto.token,
      secret: account.mfaSecret,
    })

    if (!isValid) {
      throw new UnauthorizedException("Codigo MFA invalido")
    }

    this.logger.log(`MFA verified for ${account.email}`)
    return this.generateTokens(account, true)
  }

  async generateMfaSecret(userId: string) {
    const account = await this.prisma.account.findUnique({ where: { id: userId } })

    if (!account) {
      throw new NotFoundException("Usuario no encontrado")
    }

    const secret = authenticator.generateSecret()
    const otpauth = authenticator.keyuri(
      account.email,
      this.config.get("MFA_ISSUER", "ArellanHnos"),
      secret,
    )

    await this.prisma.account.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false },
    })

    return { secret, otpauth }
  }

  async confirmMfaSetup(userId: string, token: string) {
    const account = await this.prisma.account.findUnique({ where: { id: userId } })

    if (!account || !account.mfaSecret) {
      throw new NotFoundException("MFA no configurada")
    }

    const isValid = authenticator.verify({
      token,
      secret: account.mfaSecret,
    })

    if (!isValid) {
      throw new UnauthorizedException("Codigo MFA invalido")
    }

    await this.prisma.account.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    })

    return { message: "MFA activada correctamente" }
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

    const passwordHash = await bcrypt.hash(dto.newPassword, 12)
    await this.prisma.account.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return { message: "Contrasena actualizada correctamente" }
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

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { account: true },
    })

    if (!stored || stored.revoked || new Date() > stored.expiresAt) {
      throw new UnauthorizedException("Refresh token revocado")
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    })

    return this.generateTokens(stored.account, false, stored.ipAddress || undefined, stored.deviceInfo || undefined)
  }

  async logout(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (stored) {
      await this.invalidateSession(stored.accountId, refreshToken)
    }

    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    })
    return { message: "Sesion cerrada correctamente" }
  }

  async forceLogoutUser(targetUserId: string, performerId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { accountId: targetUserId, revoked: false },
      data: { revoked: true },
    })

    await this.invalidateAllSessions(targetUserId)

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

  async storeSession(accountId: string, token: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex")
    await this.redis.set(`session:${accountId}:${token}`, tokenHash, 604800)
  }

  async invalidateSession(accountId: string, token: string) {
    await this.redis.del(`session:${accountId}:${token}`)
  }

  async invalidateAllSessions(accountId: string) {
    const keys = await this.scanKeys(`session:${accountId}:*`)
    if (keys.length > 0) {
      await this.redis.client.del(...keys)
    }
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

    await this.invalidateAllSessions(accountId)

    await this.prisma.refreshToken.updateMany({
      where: { accountId, revoked: false },
      data: { revoked: true },
    })

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
    return this.prisma.refreshToken.findMany({
      where: { accountId: userId, revoked: false },
      select: {
        id: true,
        token: true,
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

  private async generateTokens(account: Account, mfaVerified = false, ip?: string, userAgent?: string) {
    const payload: AuthUser = {
      id: account.id,
      email: account.email,
      role: account.role,
      name: account.name,
      mfaVerified: mfaVerified || !account.mfaEnabled,
    }

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get("JWT_ACCESS_TTL", "15m"),
    })

    const refreshToken = this.jwt.sign(
      { sub: account.id },
      { secret: this.config.get("JWT_REFRESH_SECRET"), expiresIn: this.config.get("JWT_REFRESH_TTL", "7d") }
    )

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        accountId: account.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        deviceInfo: userAgent,
      },
    })

    await this.storeSession(account.id, refreshToken)

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
