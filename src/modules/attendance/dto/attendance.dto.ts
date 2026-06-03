import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUUID,
  IsEnum,
} from "class-validator"
import { Type } from "class-transformer"
import { AttendanceType } from "@prisma/client"

export class AttendanceFilterDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(AttendanceType)
  type?: AttendanceType

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string

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
}

export class CheckInDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class CheckOutDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class VerifyAttendanceDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsDateString()
  date: string

  @IsUUID("4", { message: "ID de verificador invalido" })
  verifiedBy: string
}

export class PersonnelDateRangeDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string
}
