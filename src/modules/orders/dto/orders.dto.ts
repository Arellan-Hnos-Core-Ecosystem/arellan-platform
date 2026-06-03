import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, Min, Max } from "class-validator"
import { OrderStatus } from "@prisma/client"

export class CreateOrderDto {
  @IsUUID("4", { message: "ID de vehiculo invalido" })
  vehicleId: string

  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId: string

  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId: string

  @IsString({ message: "La descripcion es requerida" })
  description: string
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status?: OrderStatus

  @IsOptional()
  @IsString()
  diagnosis?: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Costo de mano de obra invalido" })
  laborCost?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Costo de repuestos invalido" })
  partsCost?: number

  @IsOptional()
  @IsDateString({}, { message: "Fecha de entrega estimada invalida" })
  estimatedDelivery?: string
}

export class UpdateStatusDto {
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status: OrderStatus
}

export class AssignMechanicDto {
  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId: string
}

export class OrderFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status?: OrderStatus

  @IsOptional()
  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId?: string

  @IsOptional()
  @IsDateString({}, { message: "Fecha desde invalida" })
  from?: string

  @IsOptional()
  @IsDateString({}, { message: "Fecha hasta invalida" })
  to?: string

  @IsOptional()
  @IsNumber()
  @Min(1, { message: "Limite minimo es 1" })
  @Max(100, { message: "Limite maximo es 100" })
  limit?: number

  @IsOptional()
  @IsString()
  cursor?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}
