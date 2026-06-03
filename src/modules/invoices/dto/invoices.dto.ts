import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsEnum,
  IsDateString,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { InvoiceStatus, InvoiceType } from "@prisma/client"

export class InvoiceFilterDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus

  @IsOptional()
  @IsUUID("4")
  clientId?: string

  @IsOptional()
  @IsString()
  search?: string

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

export class CreateInvoiceDto {
  @IsUUID("4", { message: "ID del cliente invalido" })
  clientId: string

  @IsOptional()
  @IsUUID("4")
  workOrderId?: string

  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsBoolean()
  includeTax?: boolean
}

export class CancelInvoiceDto {
  @IsString()
  reason: string
}

export class IssueInvoiceDto {
  @IsOptional()
  @IsString()
  notes?: string
}
