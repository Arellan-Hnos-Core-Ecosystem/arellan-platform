import { UserRole, AccountStatus, ContractType, SalaryType } from "@prisma/client";
export declare class PersonnelFilterDto {
    role?: UserRole;
    status?: AccountStatus;
    search?: string;
    page?: number;
    limit?: number;
    pageSize?: number;
}
export declare class CreatePersonnelDto {
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    password: string;
    role: UserRole;
    position: string;
    phone?: string;
    emergencyPhone?: string;
    address?: string;
    birthDate?: string;
    nationality?: string;
    contractType?: ContractType;
    department?: string;
    salary: number;
    salaryType?: SalaryType;
    startDate?: string;
    notes?: string;
}
export declare class UpdatePersonnelDto {
    firstName?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    emergencyPhone?: string;
    address?: string;
    birthDate?: string;
    nationality?: string;
    contractType?: ContractType;
    position?: string;
    department?: string;
    salary?: number;
    salaryType?: SalaryType;
    notes?: string;
}
export declare class UpdateRoleDto {
    role: UserRole;
}
export declare class UpdateAccountStatusDto {
    status: AccountStatus;
}
export declare class AuthorizeVehicleUsageDto {
    personnelId: string;
    vehicleId: string;
    purpose: string;
    destination?: string;
    odometerOut?: number;
    expectedReturn?: string;
    notes?: string;
}
export declare class AttendanceQueryDto {
    month?: number;
    year?: number;
}
export declare class CheckInOutDto {
    notes?: string;
}
