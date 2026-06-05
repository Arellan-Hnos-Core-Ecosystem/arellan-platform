import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, Min, Max, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { OrderStatus } from "@prisma/client"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateOrderDto {
  @ApiProperty({ description: "ID del vehiculo (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de vehiculo invalido" })
  vehicleId: string

  @ApiProperty({ description: "ID del cliente propietario del vehiculo (UUID v4)", example: "660e8400-e29b-41d4-a716-446655440001" })
  @IsUUID("4", { message: "ID de cliente invalido" })
  clientId: string

  @ApiProperty({ description: "ID del mecanico asignado (UUID v4 de la cuenta)", example: "770e8400-e29b-41d4-a716-446655440002" })
  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId: string

  @ApiProperty({ description: "Descripcion del trabajo solicitado por el cliente", example: "Cambio de aceite y filtros, revision de frenos delanteros" })
  @IsString({ message: "La descripcion es requerida" })
  description: string
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: "Nuevo estado de la orden segun flujo de trabajo", enum: OrderStatus, example: OrderStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status?: OrderStatus

  @ApiPropertyOptional({ description: "Diagnostico tecnico del mecanico", example: "Pastillas de freno delanteras desgastadas al 90%, discos con rayado leve" })
  @IsOptional()
  @IsString()
  diagnosis?: string

  @ApiPropertyOptional({ description: "Costo de mano de obra en Soles", example: 150.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Costo de mano de obra invalido" })
  laborCost?: number

  @ApiPropertyOptional({ description: "Costo total de repuestos en Soles", example: 450.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Costo de repuestos invalido" })
  partsCost?: number

  @ApiPropertyOptional({ description: "Fecha estimada de entrega (ISO 8601)", example: "2026-06-15T18:00:00.000Z" })
  @IsOptional()
  @IsDateString({}, { message: "Fecha de entrega estimada invalida" })
  estimatedDelivery?: string
}

export class UpdateStatusDto {
  @ApiProperty({ description: "Nuevo estado al que se desea transicionar", enum: OrderStatus, example: OrderStatus.IN_PROGRESS })
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status: OrderStatus
}

export class AssignMechanicDto {
  @ApiProperty({ description: "ID del mecanico a reasignar (UUID v4)", example: "880e8400-e29b-41d4-a716-446655440003" })
  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId: string
}

export class ApplyDiscountDto {
  @ApiPropertyOptional({ description: "Monto fijo de descuento en Soles", example: 50.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Monto de descuento invalido" })
  discountAmount?: number

  @ApiPropertyOptional({ description: "Porcentaje de descuento (0-100)", example: 10, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: "Porcentaje de descuento invalido" })
  @Min(0)
  @Max(100)
  discountPercentage?: number

  @ApiProperty({ description: "Razon comercial del descuento", example: "Cliente frecuente - descuento por fidelidad" })
  @IsString({ message: "Razon del descuento requerida" })
  reason: string
}

export class OrderFilterDto {
  @ApiPropertyOptional({ description: "Filtrar por estado de orden", enum: OrderStatus, example: OrderStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(OrderStatus, { message: "Estado de orden invalido" })
  status?: OrderStatus

  @ApiPropertyOptional({ description: "Filtrar por ID del mecanico asignado", example: "990e8400-e29b-41d4-a716-446655440004" })
  @IsOptional()
  @IsUUID("4", { message: "ID de mecanico invalido" })
  mechanicId?: string

  @ApiPropertyOptional({ description: "Fecha de inicio del rango (ISO 8601)", example: "2026-06-01T00:00:00.000Z" })
  @IsOptional()
  @IsDateString({}, { message: "Fecha desde invalida" })
  from?: string

  @ApiPropertyOptional({ description: "Fecha de fin del rango (ISO 8601)", example: "2026-06-30T23:59:59.000Z" })
  @IsOptional()
  @IsDateString({}, { message: "Fecha hasta invalida" })
  to?: string

  @ApiPropertyOptional({ description: "Cantidad de resultados por pagina (1-100)", example: 20, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: "Limite minimo es 1" })
  @Max(100, { message: "Limite maximo es 100" })
  limit?: number

  @ApiPropertyOptional({ description: "Cursor para paginacion (ID del ultimo elemento de la pagina anterior)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsString()
  cursor?: string
}

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

export class RequestPartsItemDto {
  @ApiProperty({ description: "ID del item de inventario (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID("4", { message: "ID de item invalido" })
  itemId: string

  @ApiProperty({ description: "Cantidad a solicitar (1-99)", example: 2, minimum: 1, maximum: 99 })
  @IsNumber()
  @Min(1, { message: "Minimo 1 unidad" })
  @Max(99, { message: "Maximo 99 unidades" })
  quantity: number
}

export class RequestPartsDto {
  @ApiProperty({ description: "Items de inventario a solicitar para la OT", type: [RequestPartsItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequestPartsItemDto)
  items: RequestPartsItemDto[]
}

export class MechanicProgressDto {
  @ApiProperty({ description: "Porcentaje de avance (0-100)", example: 75 })
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent: number

  @ApiProperty({ description: "Cantidad de repuestos instalados", example: 3 })
  @IsNumber()
  @Min(0)
  partsInstalled: number

  @ApiProperty({ description: "Horas de trabajo invertidas", example: 2.5 })
  @IsNumber()
  @Min(0)
  laborHours: number

  @ApiPropertyOptional({ description: "Notas descriptivas del avance", example: "Reparacion de frenos al 80%, falta purgado" })
  @IsOptional()
  @IsString()
  notes?: string
}
