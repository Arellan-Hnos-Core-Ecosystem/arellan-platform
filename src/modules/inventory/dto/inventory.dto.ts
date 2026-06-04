import { IsString, IsNumber, IsOptional, IsEnum, Min, IsUUID } from "class-validator"
import { MovementType } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateItemDto {
  @ApiProperty({ description: "Codigo SKU unico del repuesto/insumo", example: "FIL-001" })
  @IsString({ message: "SKU es requerido" })
  sku!: string

  @ApiProperty({ description: "Nombre descriptivo del item", example: "Filtro de Aceite Toyota Original" })
  @IsString({ message: "Nombre es requerido" })
  name!: string

  @ApiProperty({ description: "ID de la categoria del item (UUID v4 de Category)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsString({ message: "Categoria es requerida" })
  category!: string

  @ApiProperty({ description: "Cantidad inicial en stock", example: 40, minimum: 0 })
  @IsNumber({}, { message: "Stock debe ser un numero" })
  @Min(0, { message: "Stock no puede ser negativo" })
  stock!: number

  @ApiProperty({ description: "Stock minimo antes de generar alerta de reposicion", example: 10, minimum: 1 })
  @IsNumber({}, { message: "Stock minimo debe ser un numero" })
  @Min(1, { message: "Stock minimo debe ser al menos 1" })
  minStock!: number

  @ApiProperty({ description: "Precio de venta unitario en Soles", example: 35.0, minimum: 0.01 })
  @IsNumber({}, { message: "Precio unitario debe ser un numero" })
  @Min(0.01, { message: "Precio unitario debe ser mayor a cero" })
  unitPrice!: number
}

export class UpdateItemDto {
  @ApiPropertyOptional({ description: "Nuevo codigo SKU", example: "FIL-001-V2" })
  @IsOptional()
  @IsString({ message: "SKU invalido" })
  sku?: string

  @ApiPropertyOptional({ description: "Nuevo nombre del item", example: "Filtro de Aceite Toyota Original - Version 2026" })
  @IsOptional()
  @IsString({ message: "Nombre invalido" })
  name?: string

  @ApiPropertyOptional({ description: "Nuevo ID de categoria", example: "660e8400-e29b-41d4-a716-446655440001" })
  @IsOptional()
  @IsString({ message: "Categoria invalida" })
  category?: string

  @ApiPropertyOptional({ description: "Nuevo stock (ajuste manual)", example: 50, minimum: 0 })
  @IsOptional()
  @IsNumber({}, { message: "Stock debe ser un numero" })
  @Min(0, { message: "Stock no puede ser negativo" })
  stock?: number

  @ApiPropertyOptional({ description: "Nuevo stock minimo", example: 8, minimum: 1 })
  @IsOptional()
  @IsNumber({}, { message: "Stock minimo debe ser un numero" })
  @Min(1, { message: "Stock minimo debe ser al menos 1" })
  minStock?: number

  @ApiPropertyOptional({ description: "Nuevo precio unitario en Soles", example: 38.5, minimum: 0.01 })
  @IsOptional()
  @IsNumber({}, { message: "Precio unitario debe ser un numero" })
  @Min(0.01, { message: "Precio unitario debe ser mayor a cero" })
  unitPrice?: number
}

export class InventoryMovementDto {
  @ApiProperty({ description: "Tipo de movimiento de inventario", enum: MovementType, example: MovementType.OUT })
  @IsEnum(MovementType, { message: "Tipo de movimiento invalido. Valores: IN, OUT, ADJUSTMENT" })
  type!: MovementType

  @ApiProperty({ description: "Cantidad de unidades movidas (min 1)", example: 2, minimum: 1 })
  @IsNumber({}, { message: "Cantidad debe ser un numero" })
  @Min(1, { message: "Cantidad debe ser mayor a cero" })
  quantity!: number

  @ApiPropertyOptional({ description: "ID de OT asociada (requerido para tipo OUT)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsUUID("4", { message: "ID de orden de trabajo invalido" })
  orderId?: string

  @ApiPropertyOptional({ description: "Justificacion del movimiento (requerido para ADJUSTMENT)", example: "Consumo en OT-2026-0001 - Cambio de aceite Toyota Hilux ABC-123" })
  @IsOptional()
  @IsString({ message: "Justificacion invalida" })
  justification?: string
}
