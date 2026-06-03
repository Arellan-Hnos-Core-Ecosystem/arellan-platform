import { UserRole } from "@prisma/client";
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class MfaVerifyDto {
    token: string;
    sessionToken: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    pin?: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForceLogoutDto {
    userId: string;
}
