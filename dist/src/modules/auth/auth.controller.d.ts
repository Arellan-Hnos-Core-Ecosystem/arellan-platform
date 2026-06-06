import { Response } from "express";
import { AuthService, AuthUser } from "./auth.service";
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto, ForceLogoutDto, MechanicLoginDto } from "./dto/auth.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: any, res: Response): Promise<{
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
    mechanicLogin(dto: MechanicLoginDto, req: any, res: Response): Promise<{
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
    verifyMfa(dto: MfaVerifyDto, res: Response): Promise<{
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
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    generateMfa(user: AuthUser): Promise<{
        secret: string;
        otpauth: string;
    }>;
    confirmMfa(user: AuthUser, token: string): Promise<{
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
    logoutWithAccessToken(user: AuthUser): Promise<{
        message: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    logoutAll(user: AuthUser): Promise<{
        message: string;
    }>;
    getSessions(user: AuthUser): Promise<{
        id: string;
        createdAt: Date;
        token: string;
        ipAddress: string | null;
        expiresAt: Date;
        deviceInfo: string | null;
    }[]>;
    revokeSession(sessionId: string, user: AuthUser): Promise<{
        message: string;
    }>;
    forceLogout(dto: ForceLogoutDto, user: AuthUser): Promise<{
        message: string;
    }>;
    changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: AuthUser): Promise<{
        id: string;
        email: string;
        mfaEnabled: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        createdAt: Date;
    }>;
}
