import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNumber,
  IsUUID,
  MinLength,
} from "class-validator"
import { Type } from "class-transformer"
import { UserRole, AccountStatus, ContractType, SalaryType } from "@prisma/client"

export class PersonnelFilterDto {
  @IsOptional()
  @IsEnum(UserRole, { message: "Rol invalido" })
  role?: UserRole

  @IsOptional()
  @IsEnum(AccountStatus, { message: "Estado invalido" })
  status?: AccountStatus

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number

  // Alias de limit enviado por el panel admin (?page=1&pageSize=10)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number
}

export class CreatePersonnelDto {
  @IsString()
  @MinLength(2)
  firstName: string

  @IsString()
  @MinLength(2)
  lastName: string

  @IsString()
  @MinLength(8)
  dni: string

  @IsString()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsEnum(UserRole, { message: "Rol invalido" })
  role: UserRole

  @IsString()
  position: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  emergencyPhone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  nationality?: string

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType

  @IsOptional()
  @IsString()
  department?: string

  @IsNumber({ maxDecimalPlaces: 2 })
  salary: number

  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdatePersonnelDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  dni?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  emergencyPhone?: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  nationality?: string

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType

  @IsOptional()
  @IsString()
  position?: string

  @IsOptional()
  @IsString()
  department?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  salary?: number

  @IsOptional()
  @IsEnum(SalaryType)
  salaryType?: SalaryType

  @IsOptional()
  @IsString()
  notes?: string
}

export class UpdateRoleDto {
  @IsEnum(UserRole, { message: "Rol invalido" })
  role: UserRole
}

export class UpdateAccountStatusDto {
  @IsEnum(AccountStatus, { message: "Estado invalido" })
  status: AccountStatus
}

export class AuthorizeVehicleUsageDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsUUID("4", { message: "ID de vehiculo invalido" })
  vehicleId: string

  @IsString()
  purpose: string

  @IsOptional()
  @IsString()
  destination?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  odometerOut?: number

  @IsOptional()
  @IsDateString()
  expectedReturn?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class AttendanceQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number
}

export class CheckInOutDto {
  @IsOptional()
  @IsString()
  notes?: string
}
