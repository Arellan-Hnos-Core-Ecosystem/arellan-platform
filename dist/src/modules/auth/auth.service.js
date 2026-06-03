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
const bcrypt = require("bcryptjs");
const otplib_1 = require("otplib");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwt;
    config;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async login(dto) {
        const account = await this.prisma.account.findUnique({
            where: { email: dto.email },
        });
        if (!account || account.status === "TERMINATED") {
            throw new common_1.UnauthorizedException("Credenciales invalidas");
        }
        const isValid = await bcrypt.compare(dto.password, account.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException("Credenciales invalidas");
        }
        if (account.mfaEnabled) {
            const sessionToken = this.jwt.sign({ sub: account.id, mfaPending: true, role: account.role }, { secret: this.config.get("JWT_ACCESS_SECRET"), expiresIn: "5m" });
            return {
                mfaPending: true,
                sessionToken,
                message: "Ingresa el codigo de autenticacion de tu app 2FA",
            };
        }
        return this.generateTokens(account);
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
        const passwordHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.account.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: "Contrasena actualizada correctamente" };
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
        return this.generateTokens(stored.account);
    }
    async logout(refreshToken) {
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
    async generateTokens(account, mfaVerified = false) {
        const payload = {
            id: account.id,
            email: account.email,
            role: account.role,
            name: account.name,
            mfaVerified: mfaVerified || !account.mfaEnabled,
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
            },
        });
        return {
            accessToken,
            refreshToken,
            user: { id: account.id, email: account.email, name: account.name, role: account.role, mfaEnabled: account.mfaEnabled },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map