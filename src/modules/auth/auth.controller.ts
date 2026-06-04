import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards, HttpCode } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger"
import { AuthService, AuthUser } from "./auth.service"
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto, ForceLogoutDto, MechanicLoginDto } from "./dto/auth.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({
    summary: "Iniciar sesion con email y contrasena",
    description: "Autentica al usuario usando credenciales corporativas. Si MFA esta habilitado, retorna sessionToken para continuar con verificacion TOTP. Bloquea la cuenta tras 5 intentos fallidos durante 15 minutos.",
  })
  @ApiBody({ type: LoginDto, description: "Credenciales de acceso" })
  @ApiResponse({ status: 200, description: "Login exitoso - retorna accessToken, refreshToken y datos del usuario" })
  @ApiResponse({ status: 202, description: "MFA pendiente - retorna sessionToken para verifyMfa" })
  @ApiResponse({ status: 401, description: "Credenciales invalidas o cuenta inactiva" })
  @ApiResponse({ status: 429, description: "Cuenta bloqueada por multiples intentos fallidos" })
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress || "unknown"
    const userAgent = req.headers?.["user-agent"]
    return this.authService.login(dto, ip, userAgent)
  }

  @Post("mechanic/login")
  @ApiOperation({
    summary: "Login rapido para mecanicos via PIN",
    description: "Autentica a mecanicos y practicantes usando su PIN numerico de 6 digitos. Solo valido para roles MECHANIC y TRAINEE con cuenta ACTIVA. Disenado para tablets del taller.",
  })
  @ApiBody({ type: MechanicLoginDto, description: "PIN de 6 digitos" })
  @ApiResponse({ status: 200, description: "Login exitoso - retorna accessToken, refreshToken y datos del mecanico" })
  @ApiResponse({ status: 401, description: "PIN invalido, cuenta inactiva o rol no autorizado para tablet" })
  mechanicLogin(@Body() dto: MechanicLoginDto, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress || "unknown"
    const userAgent = req.headers?.["user-agent"]
    return this.authService.mechanicLogin(dto.pin, ip, userAgent)
  }

  @Post("mfa/verify")
  @ApiOperation({
    summary: "Verificar codigo MFA (TOTP)",
    description: "Valida el codigo TOTP de 6 digitos contra el secreto MFA del usuario. Requiere el sessionToken obtenido en el paso de login. Completa el flujo de autenticacion en dos pasos.",
  })
  @ApiBody({ type: MfaVerifyDto, description: "Token TOTP y sessionToken" })
  @ApiResponse({ status: 200, description: "MFA verificado - retorna accessToken, refreshToken y datos del usuario" })
  @ApiResponse({ status: 401, description: "Codigo TOTP invalido o sesion expirada" })
  verifyMfa(@Body() dto: MfaVerifyDto) {
    return this.authService.verifyMfa(dto)
  }

  @Post("register")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Registrar nuevo usuario (solo OWNER)",
    description: "Crea una nueva cuenta en el sistema. Exclusivo para el rol OWNER. Asigna rol, nombre y credenciales iniciales. Opcionalmente asigna PIN para mecanicos.",
  })
  @ApiBody({ type: RegisterDto, description: "Datos del nuevo usuario a registrar" })
  @ApiResponse({ status: 201, description: "Usuario registrado exitosamente" })
  @ApiResponse({ status: 400, description: "Email ya registrado o datos invalidos" })
  @ApiResponse({ status: 401, description: "JWT invalido o expirado" })
  @ApiResponse({ status: 403, description: "Solo OWNER puede registrar usuarios" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get("mfa/generate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Generar secreto MFA (TOTP)",
    description: "Genera un secreto TOTP y URL otpauth para configurar en Google Authenticator o similar. El MFA queda pendiente de confirmacion via /auth/mfa/confirm.",
  })
  @ApiResponse({ status: 200, description: "Secreto MFA generado - retorna secret y otpauth URL" })
  @ApiResponse({ status: 401, description: "JWT invalido o expirado" })
  generateMfa(@CurrentUser() user: AuthUser) {
    return this.authService.generateMfaSecret(user.id)
  }

  @Post("mfa/confirm")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Confirmar activacion de MFA",
    description: "Verifica un codigo TOTP contra el secreto pendiente para activar definitivamente MFA en la cuenta. Una vez activado, todos los logins posteriores requeriran segundo factor.",
  })
  @ApiBody({ description: "Codigo TOTP de verificacion", schema: { type: "object", properties: { token: { type: "string", example: "482951", description: "Codigo TOTP de 6 digitos" } } } })
  @ApiResponse({ status: 200, description: "MFA activado correctamente" })
  @ApiResponse({ status: 401, description: "Codigo TOTP invalido o JWT expirado" })
  @ApiResponse({ status: 404, description: "MFA no configurada previamente" })
  confirmMfa(@CurrentUser() user: AuthUser, @Body("token") token: string) {
    return this.authService.confirmMfaSetup(user.id, token)
  }

  @Post("refresh")
  @ApiOperation({
    summary: "Renovar tokens de acceso",
    description: "Usa un refreshToken valido para generar un nuevo par accessToken + refreshToken. El refreshToken anterior es revocado inmediatamente (rotacion).",
  })
  @ApiBody({ description: "Refresh token actual", schema: { type: "object", properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs...", description: "Token de refresco vigente" } } } })
  @ApiResponse({ status: 200, description: "Tokens renovados exitosamente" })
  @ApiResponse({ status: 401, description: "Refresh token invalido, expirado o revocado" })
  refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Post("logout")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Cerrar todas las sesiones activas",
    description: "Invalida todos los refresh tokens y sesiones Redis del usuario autenticado. Usa el accessToken del header para identificar al usuario.",
  })
  @ApiResponse({ status: 200, description: "Sesiones cerradas correctamente" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  logoutWithAccessToken(@CurrentUser() user: AuthUser) {
    return this.authService.logoutAll(user.id)
  }

  @Delete("logout")
  @ApiOperation({
    summary: "Cerrar sesion por refresh token",
    description: "Revoca un refresh token especifico sin requerir JWT. Util para limpiar sesiones desde dispositivos que solo tienen el refresh token.",
  })
  @ApiBody({ description: "Refresh token a revocar", schema: { type: "object", properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." } } } })
  @ApiResponse({ status: 200, description: "Sesion cerrada correctamente" })
  logout(@Body("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken)
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Cerrar todas las sesiones (forzado)",
    description: "Invalida absolutamente todas las sesiones activas del usuario, incluyendo Redis y refresh tokens. Registra evento de auditoria LOGOUT_ALL.",
  })
  @ApiResponse({ status: 200, description: "Todas las sesiones cerradas" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.authService.logoutAll(user.id)
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Listar sesiones activas",
    description: "Devuelve todos los refresh tokens activos (no revocados) del usuario autenticado, incluyendo IP, dispositivo y fecha de creacion.",
  })
  @ApiResponse({ status: 200, description: "Lista de sesiones activas" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getSessions(@CurrentUser() user: AuthUser) {
    return this.authService.getSessions(user.id)
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Revocar una sesion especifica",
    description: "Revoca un refresh token individual por su ID. El usuario solo puede revocar sus propias sesiones.",
  })
  @ApiParam({ name: "id", description: "ID del refresh token a revocar", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiResponse({ status: 200, description: "Sesion revocada correctamente" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 404, description: "Sesion no encontrada" })
  revokeSession(@Param("id") sessionId: string, @CurrentUser() user: AuthUser) {
    return this.authService.revokeSession(sessionId, user.id)
  }

  @Post("force-logout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Forzar cierre de sesion de otro usuario (OWNER)",
    description: "Permite al OWNER revocar todas las sesiones activas de cualquier usuario del sistema. Registra evento de auditoria.",
  })
  @ApiBody({ type: ForceLogoutDto, description: "ID del usuario objetivo" })
  @ApiResponse({ status: 200, description: "Sesiones del usuario forzadas a cerrar" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo OWNER puede forzar cierre de sesion" })
  forceLogout(@Body() dto: ForceLogoutDto, @CurrentUser() user: AuthUser) {
    return this.authService.forceLogoutUser(dto.userId, user.id)
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Cambiar contrasena",
    description: "Permite al usuario autenticado cambiar su contrasena. Requiere la contrasena actual para verificacion. La nueva contrasena se hashea con bcrypt (12 rondas).",
  })
  @ApiBody({ type: ChangePasswordDto, description: "Contrasena actual y nueva" })
  @ApiResponse({ status: 200, description: "Contrasena actualizada correctamente" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 401, description: "Contrasena actual incorrecta o JWT invalido" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Obtener perfil del usuario autenticado",
    description: "Retorna los datos del perfil: id, email, nombre, rol, estado MFA, estado de cuenta, fecha de creacion.",
  })
  @ApiResponse({ status: 200, description: "Perfil del usuario" })
  @ApiResponse({ status: 401, description: "JWT invalido o expirado" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id)
  }
}
