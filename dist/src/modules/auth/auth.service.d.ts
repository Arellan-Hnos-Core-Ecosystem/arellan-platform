import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
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
    private readonly logger;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    login(dto: LoginDto): Promise<{
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
    private generateTokens;
}
