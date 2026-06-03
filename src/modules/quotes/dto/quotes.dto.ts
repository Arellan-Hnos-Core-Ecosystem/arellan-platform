import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsEnum,
  IsDateString,
} from "class-validator"
import { Type } from "class-transformer"
import { QuoteStatus } from "@prisma/client"

export class QuoteFilterDto {
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus

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

export class CreateQuoteDto {
  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId: string

  @IsOptional()
  @IsUUID("4")
  workOrderId?: string

  @IsDateString()
  validUntil: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class RejectQuoteDto {
  @IsString()
  reason: string
}
