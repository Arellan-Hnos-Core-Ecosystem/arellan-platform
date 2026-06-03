import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  IsUUID,
} from "class-validator"
import { MovementType } from "@prisma/client"

export class CreateItemDto {
  @IsString({ message: "SKU es requerido" })
  sku!: string

  @IsString({ message: "Nombre es requerido" })
  name!: string

  @IsString({ message: "Categoria es requerida" })
  category!: string

  @IsNumber({}, { message: "Stock debe ser un numero" })
  @Min(0, { message: "Stock no puede ser negativo" })
  stock!: number

  @IsNumber({}, { message: "Stock minimo debe ser un numero" })
  @Min(1, { message: "Stock minimo debe ser al menos 1" })
  minStock!: number

  @IsNumber({}, { message: "Precio unitario debe ser un numero" })
  @Min(0.01, { message: "Precio unitario debe ser mayor a cero" })
  unitPrice!: number
}

export class UpdateItemDto {
  @IsOptional()
  @IsString({ message: "SKU invalido" })
  sku?: string

  @IsOptional()
  @IsString({ message: "Nombre invalido" })
  name?: string

  @IsOptional()
  @IsString({ message: "Categoria invalida" })
  category?: string

  @IsOptional()
  @IsNumber({}, { message: "Stock debe ser un numero" })
  @Min(0, { message: "Stock no puede ser negativo" })
  stock?: number

  @IsOptional()
  @IsNumber({}, { message: "Stock minimo debe ser un numero" })
  @Min(1, { message: "Stock minimo debe ser al menos 1" })
  minStock?: number

  @IsOptional()
  @IsNumber({}, { message: "Precio unitario debe ser un numero" })
  @Min(0.01, { message: "Precio unitario debe ser mayor a cero" })
  unitPrice?: number
}

export class InventoryMovementDto {
  @IsEnum(MovementType, { message: "Tipo de movimiento invalido. Valores: IN, OUT, ADJUSTMENT" })
  type!: MovementType

  @IsNumber({}, { message: "Cantidad debe ser un numero" })
  @Min(1, { message: "Cantidad debe ser mayor a cero" })
  quantity!: number

  @IsOptional()
  @IsUUID("4", { message: "ID de orden de trabajo invalido" })
  orderId?: string

  @IsOptional()
  @IsString({ message: "Justificacion invalida" })
  justification?: string
}
