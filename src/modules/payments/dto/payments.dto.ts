import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsEnum, IsNumber, IsDateString, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
import { PaymentMethod, PaymentChannel } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class PaymentFilterDto {
  @ApiPropertyOptional({ description: "Filtrar por metodo de pago", enum: PaymentMethod, example: PaymentMethod.YAPE })
  @IsOptional() @IsEnum(PaymentMethod) method?: PaymentMethod
  @ApiPropertyOptional({ description: "Filtrar por ID de OT" }) @IsOptional() @IsUUID("4") orderId?: string
  @ApiPropertyOptional({ description: "Filtrar por ID de factura" }) @IsOptional() @IsUUID("4") invoiceId?: string
  @ApiPropertyOptional({ description: "Fecha inicio ISO", example: "2026-06-01" }) @IsOptional() @IsDateString() from?: string
  @ApiPropertyOptional({ description: "Fecha fin ISO", example: "2026-06-30" }) @IsOptional() @IsDateString() to?: string
  @ApiPropertyOptional({ description: "Busqueda por referencia" }) @IsOptional() @IsString() search?: string
  @ApiPropertyOptional({ description: "Numero de pagina", example: 1, minimum: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ description: "Resultados por pagina", example: 20, minimum: 1, maximum: 100 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number
}

export class CreatePaymentDto {
  @ApiPropertyOptional({ description: "ID de factura asociada (UUID v4)" })
  @IsOptional() @IsUUID("4") invoiceId?: string
  @ApiPropertyOptional({ description: "ID de orden de trabajo asociada (UUID v4)" })
  @IsOptional() @IsUUID("4") workOrderId?: string
  @ApiProperty({ description: "Metodo de pago", enum: PaymentMethod, example: PaymentMethod.YAPE })
  @IsEnum(PaymentMethod, { message: "Metodo de pago invalido" }) method: PaymentMethod
  @ApiProperty({ description: "Monto del pago en Soles", example: 450.0, minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) amount: number
  @ApiPropertyOptional({ description: "Referencia o numero de operacion", example: "OP-001234567" })
  @IsOptional() @IsString() reference?: string
  @ApiPropertyOptional({ description: "Canal de pago", enum: PaymentChannel, example: PaymentChannel.IN_PERSON })
  @IsOptional() @IsEnum(PaymentChannel) channel?: PaymentChannel
  @ApiPropertyOptional({ description: "Indica si el pago se recibio en Yape personal (dispara alerta antifraude)", example: false })
  @IsOptional() @IsBoolean() isPersonalYape?: boolean
  @ApiPropertyOptional({ description: "Numero de cuenta Yape (si es personal)", example: "987654321" })
  @IsOptional() @IsString() yapeAccount?: string
  @ApiPropertyOptional({ description: "Notas del pago" })
  @IsOptional() @IsString() notes?: string
  @ApiPropertyOptional({ description: "URL del comprobante" })
  @IsOptional() @IsString() receiptUrl?: string
  @ApiPropertyOptional({ description: "Fecha del pago (ISO)", example: "2026-06-15T14:30:00.000Z" })
  @IsOptional() @IsDateString() paidAt?: string
}

export class VerifyPaymentDto {
  @ApiProperty({ description: "ID del usuario que verifica el pago (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID del verificador invalido" }) verifierId: string
}
