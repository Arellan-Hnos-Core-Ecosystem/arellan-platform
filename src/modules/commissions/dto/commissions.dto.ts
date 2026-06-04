import { IsOptional, IsString, IsInt, Min, Max, IsUUID, IsEnum, IsNumber, IsDateString } from "class-validator"
import { Type } from "class-transformer"
import { ApprovalStatus } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CommissionFilterDto {
  @ApiPropertyOptional({ enum: ApprovalStatus }) @IsOptional() @IsEnum(ApprovalStatus) status?: ApprovalStatus
  @ApiPropertyOptional() @IsOptional() @IsUUID("4") personnelId?: string
  @ApiPropertyOptional() @IsOptional() @IsUUID("4") supplierId?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string
  @ApiPropertyOptional({ example: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number
  @ApiPropertyOptional({ example: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number
}

export class CreateCommissionDto {
  @ApiProperty({ description: "ID del personal que recibe la comision (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de personal invalido" }) personnelId: string
  @ApiPropertyOptional({ description: "ID del proveedor asociado (opcional)" })
  @IsOptional() @IsUUID("4") supplierId?: string
  @ApiPropertyOptional({ description: "ID de la compra asociada (opcional)" })
  @IsOptional() @IsUUID("4") purchaseId?: string
  @ApiProperty({ description: "Tipo de comision", example: "IMPORT_COMMISSION" })
  @IsString() type: string
  @ApiProperty({ description: "Monto de comision en Soles", example: 350.0 })
  @IsNumber({ maxDecimalPlaces: 2 }) amount: number
  @ApiPropertyOptional({ description: "Porcentaje de comision", example: 5.0 })
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) percentage?: number
  @ApiPropertyOptional({ description: "Notas" })
  @IsOptional() @IsString() notes?: string
}

export class ApproveCommissionDto {
  @ApiProperty({ description: "ID del aprobador (UUID v4)", example: "770e8400-e29b-41d4-a716-446655440002" })
  @IsUUID("4", { message: "ID de aprobador invalido" }) approverId: string
}
