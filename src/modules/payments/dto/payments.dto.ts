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
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { PaymentMethod, PaymentChannel } from "@prisma/client"

export class PaymentFilterDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod

  @IsOptional()
  @IsUUID("4")
  orderId?: string

  @IsOptional()
  @IsUUID("4")
  invoiceId?: string

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string

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
}

export class CreatePaymentDto {
  @IsOptional()
  @IsUUID("4")
  invoiceId?: string

  @IsOptional()
  @IsUUID("4")
  workOrderId?: string

  @IsEnum(PaymentMethod, { message: "Metodo de pago invalido" })
  method: PaymentMethod

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number

  @IsOptional()
  @IsString()
  reference?: string

  @IsOptional()
  @IsEnum(PaymentChannel)
  channel?: PaymentChannel

  @IsOptional()
  @IsBoolean()
  isPersonalYape?: boolean

  @IsOptional()
  @IsString()
  yapeAccount?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  receiptUrl?: string

  @IsOptional()
  @IsDateString()
  paidAt?: string
}

export class VerifyPaymentDto {
  @IsUUID("4", { message: "ID del verificador invalido" })
  verifierId: string
}

export class MethodFilterDto {
  @IsEnum(PaymentMethod, { message: "Metodo de pago invalido" })
  method: PaymentMethod

  @IsDateString()
  from: string

  @IsDateString()
  to: string
}
