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
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { PurchaseStatus } from "@prisma/client"

export class PurchaseFilterDto {
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus

  @IsOptional()
  @IsUUID("4")
  supplierId?: string

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

export class PurchaseItemDto {
  @IsUUID("4", { message: "ID de item invalido" })
  itemId: string

  @IsInt()
  @Min(1)
  quantity: number

  @IsNumber({ maxDecimalPlaces: 2 })
  unitCost: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreatePurchaseDto {
  @IsUUID("4", { message: "ID de proveedor invalido" })
  supplierId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[]

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  tax?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  shipping?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  customs?: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsBoolean()
  isImported?: boolean

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsDateString()
  expectedAt?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  commissionAmount?: number

  @IsOptional()
  @IsUUID("4")
  commissionTo?: string
}

export class UpdatePurchaseStatusDto {
  @IsEnum(PurchaseStatus, { message: "Estado de compra invalido" })
  status: PurchaseStatus
}

export class ReceiveItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[]
}

export class ReceiveItemDto {
  @IsUUID("4", { message: "ID del item de compra invalido" })
  itemId: string

  @IsInt()
  @Min(1)
  qty: number
}
