import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsEnum, IsDateString } from "class-validator"
import { Type } from "class-transformer"
import { QuoteStatus } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class QuoteFilterDto {
  @ApiPropertyOptional({ enum: QuoteStatus }) @IsOptional() @IsEnum(QuoteStatus) status?: QuoteStatus
  @ApiPropertyOptional({ description: "ID del cliente" }) @IsOptional() @IsUUID("4") clientId?: string
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number
}

export class CreateQuoteDto {
  @ApiProperty({ description: "ID del cliente (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de cliente invalido" }) clientId: string
  @ApiPropertyOptional({ description: "ID de OT vinculada (opcional)", example: "660e8400-e29b-41d4-a716-446655440001" })
  @IsOptional() @IsUUID("4") workOrderId?: string
  @ApiProperty({ description: "Fecha de validez de la cotizacion (ISO)", example: "2026-07-15T18:00:00.000Z" })
  @IsDateString() validUntil: string
  @ApiPropertyOptional({ description: "Notas de la cotizacion", example: "Incluye repuestos originales y mano de obra con garantia de 90 dias" })
  @IsOptional() @IsString() notes?: string
}

export class RejectQuoteDto {
  @ApiProperty({ description: "Motivo del rechazo", example: "Cliente no acepta el presupuesto - solicita revision de precios" })
  @IsString() reason: string
}
