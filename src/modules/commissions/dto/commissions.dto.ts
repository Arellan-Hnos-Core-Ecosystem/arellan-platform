import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator"
import { Type } from "class-transformer"
import { ApprovalStatus } from "@prisma/client"

export class CommissionFilterDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus

  @IsOptional()
  @IsUUID("4")
  personnelId?: string

  @IsOptional()
  @IsUUID("4")
  supplierId?: string

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

export class CreateCommissionDto {
  @IsUUID("4", { message: "ID de personal invalido" })
  personnelId: string

  @IsOptional()
  @IsUUID("4")
  supplierId?: string

  @IsOptional()
  @IsUUID("4")
  purchaseId?: string

  @IsString()
  type: string

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  percentage?: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class ApproveCommissionDto {
  @IsUUID("4", { message: "ID de aprobador invalido" })
  approverId: string
}
