"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(dto, req, res) {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const userAgent = req.headers?.["user-agent"];
        const result = await this.authService.login(dto, ip, userAgent);
        if (!result.mfaPending) {
            res.cookie("arellan-auth", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
        }
        return result;
    }
    async mechanicLogin(dto, req, res) {
        const ip = req.ip || req.socket?.remoteAddress || "unknown";
        const userAgent = req.headers?.["user-agent"];
        const result = await this.authService.mechanicLogin(dto.pin, ip, userAgent);
        res.cookie("arellan-auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
    async verifyMfa(dto, res) {
        const result = await this.authService.verifyMfa(dto);
        res.cookie("arellan-auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return result;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    generateMfa(user) {
        return this.authService.generateMfaSecret(user);
    }
    confirmMfa(user, token) {
        return this.authService.confirmMfaSetup(user.id, token);
    }
    refreshToken(refreshToken) {
        return this.authService.refreshToken(refreshToken);
    }
    logoutWithAccessToken(user) {
        return this.authService.logoutAll(user.id);
    }
    logout(refreshToken) {
        return this.authService.logout(refreshToken);
    }
    logoutAll(user) {
        return this.authService.logoutAll(user.id);
    }
    getSessions(user) {
        return this.authService.getSessions(user.id);
    }
    revokeSession(sessionId, user) {
        return this.authService.revokeSession(sessionId, user.id);
    }
    forceLogout(dto, user) {
        return this.authService.forceLogoutUser(dto.userId, user.id);
    }
    changePassword(user, dto) {
        return this.authService.changePassword(user.id, dto);
    }
    getProfile(user) {
        return this.authService.getProfile(user.id);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("login"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: "Iniciar sesion con email y contrasena",
        description: "Autentica al usuario usando credenciales corporativas. Si MFA esta habilitado, retorna sessionToken para continuar con verificacion TOTP. Bloquea la cuenta tras 5 intentos fallidos durante 15 minutos.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.LoginDto, description: "Credenciales de acceso" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Login exitoso - retorna accessToken, refreshToken y datos del usuario" }),
    (0, swagger_1.ApiResponse)({ status: 202, description: "MFA pendiente - retorna sessionToken para verifyMfa" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Credenciales invalidas o cuenta inactiva" }),
    (0, swagger_1.ApiResponse)({ status: 429, description: "Cuenta bloqueada por multiples intentos fallidos" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)("mechanic/login"),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: "Login rapido para mecanicos via PIN",
        description: "Autentica a mecanicos y practicantes usando su PIN numerico de 6 digitos. Solo valido para roles MECHANIC y TRAINEE con cuenta ACTIVA. Disenado para tablets del taller.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.MechanicLoginDto, description: "PIN de 6 digitos" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Login exitoso - retorna accessToken, refreshToken y datos del mecanico" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "PIN invalido, cuenta inactiva o rol no autorizado para tablet" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.MechanicLoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "mechanicLogin", null);
__decorate([
    (0, common_1.Post)("mfa/verify"),
    (0, swagger_1.ApiOperation)({
        summary: "Verificar codigo MFA (TOTP)",
        description: "Valida el codigo TOTP de 6 digitos contra el secreto MFA del usuario. Requiere el sessionToken obtenido en el paso de login. Completa el flujo de autenticacion en dos pasos.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.MfaVerifyDto, description: "Token TOTP y sessionToken" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "MFA verificado - retorna accessToken, refreshToken y datos del usuario" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Codigo TOTP invalido o sesion expirada" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.MfaVerifyDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyMfa", null);
__decorate([
    (0, common_1.Post)("register"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Registrar nuevo usuario (solo OWNER)",
        description: "Crea una nueva cuenta en el sistema. Exclusivo para el rol OWNER. Asigna rol, nombre y credenciales iniciales. Opcionalmente asigna PIN para mecanicos.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.RegisterDto, description: "Datos del nuevo usuario a registrar" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Usuario registrado exitosamente" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Email ya registrado o datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o expirado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER puede registrar usuarios" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)("mfa/generate"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Generar secreto MFA (TOTP)",
        description: "Genera un secreto TOTP y URL otpauth para configurar en Google Authenticator o similar. El MFA queda pendiente de confirmacion via /auth/mfa/confirm.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Secreto MFA generado - retorna secret y otpauth URL" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o expirado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Regenerar MFA activa exige sesion con TOTP verificado (SEC-25)" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "generateMfa", null);
__decorate([
    (0, common_1.Post)("mfa/confirm"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Confirmar activacion de MFA",
        description: "Verifica un codigo TOTP contra el secreto pendiente para activar definitivamente MFA en la cuenta. Una vez activado, todos los logins posteriores requeriran segundo factor.",
    }),
    (0, swagger_1.ApiBody)({ description: "Codigo TOTP de verificacion", schema: { type: "object", properties: { token: { type: "string", example: "482951", description: "Codigo TOTP de 6 digitos" } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "MFA activado correctamente" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Codigo TOTP invalido o JWT expirado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "MFA no configurada previamente" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "confirmMfa", null);
__decorate([
    (0, common_1.Post)("refresh"),
    (0, swagger_1.ApiOperation)({
        summary: "Renovar tokens de acceso",
        description: "Usa un refreshToken valido para generar un nuevo par accessToken + refreshToken. El refreshToken anterior es revocado inmediatamente (rotacion).",
    }),
    (0, swagger_1.ApiBody)({ description: "Refresh token actual", schema: { type: "object", properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs...", description: "Token de refresco vigente" } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Tokens renovados exitosamente" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Refresh token invalido, expirado o revocado" }),
    __param(0, (0, common_1.Body)("refreshToken")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar todas las sesiones activas",
        description: "Invalida todos los refresh tokens y sesiones Redis del usuario autenticado. Usa el accessToken del header para identificar al usuario.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Sesiones cerradas correctamente" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logoutWithAccessToken", null);
__decorate([
    (0, common_1.Delete)("logout"),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar sesion por refresh token",
        description: "Revoca un refresh token especifico sin requerir JWT. Util para limpiar sesiones desde dispositivos que solo tienen el refresh token.",
    }),
    (0, swagger_1.ApiBody)({ description: "Refresh token a revocar", schema: { type: "object", properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." } } } }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Sesion cerrada correctamente" }),
    __param(0, (0, common_1.Body)("refreshToken")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("logout-all"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Cerrar todas las sesiones (forzado)",
        description: "Invalida absolutamente todas las sesiones activas del usuario, incluyendo Redis y refresh tokens. Registra evento de auditoria LOGOUT_ALL.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Todas las sesiones cerradas" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Get)("sessions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Listar sesiones activas",
        description: "Devuelve todos los refresh tokens activos (no revocados) del usuario autenticado, incluyendo IP, dispositivo y fecha de creacion.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de sesiones activas" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Delete)("sessions/:id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Revocar una sesion especifica",
        description: "Revoca un refresh token individual por su ID. El usuario solo puede revocar sus propias sesiones.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del refresh token a revocar", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Sesion revocada correctamente" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Sesion no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Post)("force-logout"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Forzar cierre de sesion de otro usuario (OWNER)",
        description: "Permite al OWNER revocar todas las sesiones activas de cualquier usuario del sistema. Registra evento de auditoria.",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ForceLogoutDto, description: "ID del usuario objetivo" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Sesiones del usuario forzadas a cerrar" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER puede forzar cierre de sesion" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForceLogoutDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forceLogout", null);
__decorate([
    (0, common_1.Post)("change-password"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Cambiar contrasena",
        description: "Permite al usuario autenticado cambiar su contrasena. Requiere la contrasena actual para verificacion. La nueva contrasena se hashea con bcrypt (12 rondas).",
    }),
    (0, swagger_1.ApiBody)({ type: auth_dto_1.ChangePasswordDto, description: "Contrasena actual y nueva" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Contrasena actualizada correctamente" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Contrasena actual incorrecta o JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Usuario no encontrado" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    (0, swagger_1.ApiOperation)({
        summary: "Obtener perfil del usuario autenticado",
        description: "Retorna los datos del perfil: id, email, nombre, rol, estado MFA, estado de cuenta, fecha de creacion.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Perfil del usuario" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o expirado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Usuario no encontrado" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("Auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map