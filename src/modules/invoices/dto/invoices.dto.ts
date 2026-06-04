import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsEnum, IsDateString, IsBoolean } from "class-validator"
import { Type } from "class-transformer"
import { InvoiceStatus, InvoiceType } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class InvoiceFilterDto {
  @ApiPropertyOptional({ description: "Filtrar por estado", enum: InvoiceStatus, example: InvoiceStatus.ISSUED })
  @IsOptional() @IsEnum(InvoiceStatus) status?: InvoiceStatus
  @ApiPropertyOptional({ description: "Filtrar por ID del cliente" })
  @IsOptional() @IsUUID("4") clientId?: string
  @ApiPropertyOptional({ description: "Busqueda por numero o concepto" })
  @IsOptional() @IsString() search?: string
  @ApiPropertyOptional({ description: "Fecha inicio ISO" }) @IsOptional() @IsDateString() from?: string
  @ApiPropertyOptional({ description: "Fecha fin ISO" }) @IsOptional() @IsDateString() to?: string
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number
}

export class CreateInvoiceDto {
  @ApiProperty({ description: "ID del cliente (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID del cliente invalido" }) clientId: string
  @ApiPropertyOptional({ description: "ID de OT vinculada" })
  @IsOptional() @IsUUID("4") workOrderId?: string
  @ApiPropertyOptional({ description: "Tipo de comprobante", enum: InvoiceType, example: InvoiceType.FACTURA })
  @IsOptional() @IsEnum(InvoiceType) type?: InvoiceType
  @ApiPropertyOptional({ description: "Notas de la factura" })
  @IsOptional() @IsString() notes?: string
  @ApiPropertyOptional({ description: "Fecha de vencimiento (ISO)", example: "2026-07-15T18:00:00.000Z" })
  @IsOptional() @IsDateString() dueDate?: string
  @ApiPropertyOptional({ description: "Incluir IGV en el calculo", example: true })
  @IsOptional() @IsBoolean() includeTax?: boolean
}

export class CancelInvoiceDto {
  @ApiProperty({ description: "Motivo de anulacion de la factura", example: "Error en monto facturado - se emitira nota de credito" })
  @IsString() reason: string
}

export class IssueInvoiceDto {
  @ApiPropertyOptional({ description: "Notas al emitir" })
  @IsOptional() @IsString() notes?: string
}
