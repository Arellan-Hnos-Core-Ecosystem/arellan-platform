import { AuthService, AuthUser } from "./auth.service";
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto, ForceLogoutDto } from "./dto/auth.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    logout(refreshToken: string): Promise<{
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
