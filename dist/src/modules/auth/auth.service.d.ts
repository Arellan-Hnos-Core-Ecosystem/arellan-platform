import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto } from "./dto/auth.dto";
import { UserRole } from "@prisma/client";
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    mfaVerified: boolean;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly config;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService, redis: RedisService);
    login(dto: LoginDto, ip: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            mfaEnabled: boolean;
        };
    } | {
        mfaPending: boolean;
        sessionToken: string;
        message: string;
    }>;
    mechanicLogin(pin: string, ip: string, userAgent?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            mfaEnabled: boolean;
        };
    }>;
    verifyMfa(dto: MfaVerifyDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            mfaEnabled: boolean;
        };
    }>;
    generateMfaSecret(userId: string): Promise<{
        secret: string;
        otpauth: string;
    }>;
    confirmMfaSetup(userId: string, token: string): Promise<{
        message: string;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            mfaEnabled: boolean;
        };
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    forceLogoutUser(targetUserId: string, performerId: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        mfaEnabled: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        createdAt: Date;
    }>;
    storeSession(accountId: string, token: string): Promise<void>;
    invalidateSession(accountId: string, token: string): Promise<void>;
    invalidateAllSessions(accountId: string): Promise<void>;
    getActiveSessions(accountId: string): Promise<string[]>;
    logoutAll(accountId: string): Promise<{
        message: string;
    }>;
    getSessions(userId: string): Promise<{
        id: string;
        createdAt: Date;
        token: string;
        ipAddress: string | null;
        expiresAt: Date;
        deviceInfo: string | null;
    }[]>;
    revokeSession(sessionId: string, userId: string): Promise<{
        message: string;
    }>;
    getUserWithPersonnel(userId: string): Promise<{
        personnelProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            accountId: string;
            dni: string;
            pin: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            emergencyPhone: string | null;
            address: string | null;
            birthDate: Date | null;
            nationality: string;
            contractType: import(".prisma/client").$Enums.ContractType;
            position: string;
            department: string | null;
            salary: import("@prisma/client/runtime/library").Decimal;
            salaryType: import(".prisma/client").$Enums.SalaryType;
            startDate: Date;
            endDate: Date | null;
            photo: string | null;
            documents: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        passwordHash: string;
        mfaSecret: string | null;
        mfaEnabled: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        lastLoginAt: Date | null;
        lastLoginIp: string | null;
        failedAttempts: number;
        lockedUntil: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    private generateTokens;
    private scanKeys;
}
