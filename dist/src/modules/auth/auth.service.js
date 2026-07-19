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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const otplib_1 = require("otplib");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwt;
    config;
    redis;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwt, config, redis) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.redis = redis;
    }
    async login(dto, ip, userAgent) {
        const account = await this.prisma.account.findUnique({
            where: { email: dto.email },
        });
        if (!account || account.status === "TERMINATED") {
            throw new common_1.UnauthorizedException("Credenciales invalidas");
        }
        if (account.lockedUntil && new Date(account.lockedUntil) > new Date()) {
            throw new common_1.HttpException({ statusCode: 429, message: "Demasiados intentos fallidos. Cuenta bloqueada 15 minutos.", code: "ACCOUNT_LOCKED" }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const isValid = await bcrypt.compare(dto.password, account.passwordHash);
        if (!isValid) {
            const failedAttempts = account.failedAttempts + 1;
            const lockedUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined;
            await this.prisma.account.update({
                where: { id: account.id },
                data: { failedAttempts, lockedUntil },
            });
            throw new common_1.UnauthorizedException("Credenciales invalidas");
        }
        await this.prisma.account.update({
            where: { id: account.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ip,
            },
        });
        if (account.mfaEnabled) {
            const sessionToken = this.jwt.sign({ sub: account.id, mfaPending: true, role: account.role }, { secret: this.config.get("JWT_ACCESS_SECRET"), expiresIn: "5m" });
            return {
                mfaPending: true,
                sessionToken,
                message: "Ingresa el codigo de autenticacion de tu app 2FA",
            };
        }
        return this.generateTokens(account, false, ip, userAgent);
    }
    async mechanicLogin(pin, ip, userAgent) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { pin },
            include: { account: true },
        });
        if (!personnel || !personnel.account) {
            throw new common_1.UnauthorizedException("PIN invalido");
        }
        const account = personnel.account;
        if (account.status !== "ACTIVE") {
            throw new common_1.UnauthorizedException("Cuenta inactiva. Contacte al administrador.");
        }
        const allowedRoles = [client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE];
        if (!allowedRoles.includes(account.role)) {
            throw new common_1.UnauthorizedException("Este PIN no corresponde a un perfil de taller");
        }
        await this.prisma.account.update({
            where: { id: account.id },
            data: { lastLoginAt: new Date(), lastLoginIp: ip },
        });
        this.logger.log(`Mechanic login: ${account.name} (${account.role}) from ${ip}`);
        return this.generateTokens(account, false, ip, userAgent);
    }
    async verifyMfa(dto) {
        let payload;
        try {
            payload = this.jwt.verify(dto.sessionToken, {
                secret: this.config.get("JWT_ACCESS_SECRET"),
            });
        }
        catch {
            throw new common_1.UnauthorizedException("Session de MFA expirada. Inicia sesion nuevamente.");
        }
        if (!payload.mfaPending) {
            throw new common_1.UnauthorizedException("Session invalida para MFA");
        }
        const account = await this.prisma.account.findUnique({
            where: { id: payload.sub },
        });
        if (!account || !account.mfaSecret) {
            throw new common_1.UnauthorizedException("MFA no configurada");
        }
        const isValid = otplib_1.authenticator.verify({
            token: dto.token,
            secret: account.mfaSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException("Codigo MFA invalido");
        }
        this.logger.log(`MFA verified for ${account.email}`);
        return this.generateTokens(account, true);
    }
    async generateMfaSecret(userId) {
        const account = await this.prisma.account.findUnique({ where: { id: userId } });
        if (!account) {
            throw new common_1.NotFoundException("Usuario no encontrado");
        }
        const secret = otplib_1.authenticator.generateSecret();
        const otpauth = otplib_1.authenticator.keyuri(account.email, this.config.get("MFA_ISSUER", "ArellanHnos"), secret);
        await this.prisma.account.update({
            where: { id: userId },
            data: { mfaSecret: secret, mfaEnabled: false },
        });
        return { secret, otpauth };
    }
    async confirmMfaSetup(userId, token) {
        const account = await this.prisma.account.findUnique({ where: { id: userId } });
        if (!account || !account.mfaSecret) {
            throw new common_1.NotFoundException("MFA no configurada");
        }
        const isValid = otplib_1.authenticator.verify({
            token,
            secret: account.mfaSecret,
        });
        if (!isValid) {
            throw new common_1.UnauthorizedException("Codigo MFA invalido");
        }
        await this.prisma.account.update({
            where: { id: userId },
            data: { mfaEnabled: true },
        });
        return { message: "MFA activada correctamente" };
    }
    async register(dto) {
        const existing = await this.prisma.account.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.UnauthorizedException("El correo ya esta registrado");
        }
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const account = await this.prisma.account.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                role: dto.role,
            },
        });
        this.logger.log(`New account: ${account.email} (${account.role})`);
        return { id: account.id, email: account.email, name: account.name, role: account.role };
    }
    async changePassword(userId, dto) {
        const account = await this.prisma.account.findUnique({ where: { id: userId } });
        if (!account)
            throw new common_1.NotFoundException("Usuario no encontrado");
        const isValid = await bcrypt.compare(dto.currentPassword, account.passwordHash);
        if (!isValid)
            throw new common_1.UnauthorizedException("Contrasena actual incorrecta");
        if (await bcrypt.compare(dto.newPassword, account.passwordHash)) {
            throw new common_1.UnauthorizedException("La nueva contrasena debe ser distinta a la actual");
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.account.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await this.prisma.refreshToken.updateMany({
            where: { accountId: userId, revoked: false },
            data: { revoked: true },
        });
        await this.invalidateAllSessions(userId);
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
        });
        return { message: "Contrasena actualizada correctamente. Vuelve a iniciar sesion." };
    }
    async refreshToken(refreshToken) {
        let payload;
        try {
            payload = this.jwt.verify(refreshToken, {
                secret: this.config.get("JWT_REFRESH_SECRET"),
            });
        }
        catch {
            throw new common_1.UnauthorizedException("Refresh token invalido o expirado");
        }
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { account: true },
        });
        if (!stored || stored.revoked || new Date() > stored.expiresAt) {
            throw new common_1.UnauthorizedException("Refresh token revocado");
        }
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revoked: true },
        });
        return this.generateTokens(stored.account, false, stored.ipAddress || undefined, stored.deviceInfo || undefined);
    }
    async logout(refreshToken) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });
        if (stored) {
            await this.invalidateSession(stored.accountId, refreshToken);
        }
        await this.prisma.refreshToken.updateMany({
            where: { token: refreshToken },
            data: { revoked: true },
        });
        return { message: "Sesion cerrada correctamente" };
    }
    async forceLogoutUser(targetUserId, performerId) {
        await this.prisma.refreshToken.updateMany({
            where: { accountId: targetUserId, revoked: false },
            data: { revoked: true },
        });
        await this.invalidateAllSessions(targetUserId);
        this.logger.log(`Force logout of user ${targetUserId} by ${performerId}`);
        return { message: "Sesion cerrada forzosamente" };
    }
    async getProfile(userId) {
        const account = await this.prisma.account.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, mfaEnabled: true, status: true, createdAt: true },
        });
        if (!account)
            throw new common_1.NotFoundException("Usuario no encontrado");
        return account;
    }
    async storeSession(accountId, token) {
        const tokenHash = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
        await this.redis.set(`session:${accountId}:${token}`, tokenHash, 604800);
    }
    async invalidateSession(accountId, token) {
        await this.redis.del(`session:${accountId}:${token}`);
    }
    async invalidateAllSessions(accountId) {
        const keys = await this.scanKeys(`session:${accountId}:*`);
        if (keys.length > 0) {
            await this.redis.client.del(...keys);
        }
    }
    async getActiveSessions(accountId) {
        const keys = await this.scanKeys(`session:${accountId}:*`);
        if (keys.length === 0)
            return [];
        const hashes = await this.redis.client.mget(...keys);
        return hashes.filter((h) => h !== null);
    }
    async logoutAll(accountId) {
        const account = await this.prisma.account.findUnique({ where: { id: accountId } });
        if (!account)
            throw new common_1.NotFoundException("Usuario no encontrado");
        await this.invalidateAllSessions(accountId);
        await this.prisma.refreshToken.updateMany({
            where: { accountId, revoked: false },
            data: { revoked: true },
        });
        await this.prisma.auditLog.create({
            data: {
                userId: accountId,
                userName: account.name,
                role: account.role,
                action: "LOGOUT_ALL",
                ipAddress: "system",
                severity: "INFO",
            },
        });
        this.logger.log(`All sessions invalidated for ${account.email}`);
        return { message: "Todas las sesiones cerradas correctamente" };
    }
    async getSessions(userId) {
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
        });
    }
    async revokeSession(sessionId, userId) {
        const session = await this.prisma.refreshToken.findFirst({
            where: { id: sessionId, accountId: userId, revoked: false },
        });
        if (!session)
            throw new common_1.NotFoundException("Sesion no encontrada");
        await this.prisma.refreshToken.update({
            where: { id: sessionId },
            data: { revoked: true },
        });
        await this.invalidateSession(userId, session.token);
        return { message: "Sesion revocada correctamente" };
    }
    async getUserWithPersonnel(userId) {
        const account = await this.prisma.account.findUnique({
            where: { id: userId },
            include: { personnelProfile: true },
        });
        if (!account)
            throw new common_1.NotFoundException("Usuario no encontrado");
        return account;
    }
    async generateTokens(account, mfaVerified = false, ip, userAgent) {
        const requiresMfa = ["OWNER", "ADMIN", "FINANCE"].includes(account.role);
        const payload = {
            id: account.id,
            email: account.email,
            role: account.role,
            name: account.name,
            mfaVerified: mfaVerified || !requiresMfa,
        };
        const accessToken = this.jwt.sign(payload, {
            secret: this.config.get("JWT_ACCESS_SECRET"),
            expiresIn: this.config.get("JWT_ACCESS_TTL", "15m"),
        });
        const refreshToken = this.jwt.sign({ sub: account.id }, { secret: this.config.get("JWT_REFRESH_SECRET"), expiresIn: this.config.get("JWT_REFRESH_TTL", "7d") });
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                accountId: account.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                ipAddress: ip,
                deviceInfo: userAgent,
            },
        });
        await this.storeSession(account.id, refreshToken);
        this.logger.log(`Session created for ${account.email}`);
        return {
            accessToken,
            refreshToken,
            user: { id: account.id, email: account.email, name: account.name, role: account.role, mfaEnabled: account.mfaEnabled },
        };
    }
    async scanKeys(pattern) {
        const keys = [];
        let cursor = "0";
        do {
            const [nextCursor, found] = await this.redis.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
            cursor = nextCursor;
            keys.push(...found);
        } while (cursor !== "0");
        return keys;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AuthService);
//# sourceMappingURL=auth.service.js.map