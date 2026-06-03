import { UserRole, AccountStatus } from "@prisma/client";
export declare class PersonnelFilterDto {
    role?: UserRole;
    status?: AccountStatus;
    limit?: number;
    cursor?: string;
}
export declare class UpdateRoleDto {
    role: UserRole;
}
export declare class UpdateStatusDto {
    status: AccountStatus;
}
