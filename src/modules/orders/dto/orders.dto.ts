import { IsString, IsOptional, IsEnum, IsNumber, IsInt, IsDateString, IsUUID, Min, Max, IsArray, ValidateNested, Matches, IsIn, MinLength, IsNotEmpty } from "class-validator"
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
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: "Limite minimo es 1" })
  @Max(100, { message: "Limite maximo es 100" })
  limit?: number

  @ApiPropertyOptional({ description: "Cursor para paginacion (ID del ultimo elemento de la pagina anterior)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional({ description: "Numero de pagina para paginacion offset (min 1)", example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number

  @ApiPropertyOptional({ description: "Resultados por pagina para paginacion offset (1-100)", example: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number
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

export class VehicleCheckinDto {
  @ApiProperty({ description: "Placa del vehiculo (formato peruano ABC-123)", example: "ABC-123" })
  @IsString()
  @Matches(/^[A-Z]{3}-\d{3}$/i, { message: "Placa invalida. Formato requerido: ABC-123" })
  plate: string

  @ApiPropertyOptional({ description: "Marca del vehiculo", example: "Toyota" })
  @IsOptional()
  @IsString()
  brand?: string

  @ApiPropertyOptional({ description: "Modelo del vehiculo", example: "Hiace" })
  @IsOptional()
  @IsString()
  model?: string

  @ApiPropertyOptional({ description: "Lectura actual del kilometraje", example: "85000" })
  @IsOptional()
  @IsString()
  kilometerReading?: string

  @ApiPropertyOptional({ description: "Nivel de combustible", enum: ["EMPTY", "QUARTER", "HALF", "THREE_QUARTERS", "FULL"] })
  @IsOptional()
  @IsString()
  fuelLevel?: string

  @ApiPropertyOptional({ description: "Descripcion del trabajo a realizar", example: "Cambio de aceite y filtros" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: "Posiciones de fotos separadas por coma (FRONT,BACK,LEFT,RIGHT,DASHBOARD)", example: "FRONT,BACK,LEFT,RIGHT,DASHBOARD" })
  @IsOptional()
  @IsString()
  photoPositions?: string
}

export class CameraCaptureDto {
  @ApiProperty({ description: "Posicion de check-in vinculada (Regla Anti-Fraude #8)", enum: ["FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD"], example: "FRONT" })
  @IsString()
  @IsNotEmpty()
  position: string

  @ApiProperty({ description: "Identificador de la camara ONVIF de origen", example: "CAM-BAHIA-01" })
  @IsString()
  @IsNotEmpty()
  cameraId: string

  @ApiProperty({ description: "Imagen capturada (snapshot ONVIF) en base64, sin prefijo data URI" })
  @IsString()
  @IsNotEmpty()
  imageBase64: string

  @ApiPropertyOptional({ description: "MIME type de la imagen", example: "image/jpeg" })
  @IsOptional()
  @IsString()
  mimeType?: string
}

export class RequestCameraCaptureDto {
  @ApiProperty({ description: "Posicion de check-in a capturar via camara ONVIF de bahia (Regla Anti-Fraude #8)", enum: ["FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD"], example: "FRONT" })
  @IsString()
  @IsNotEmpty()
  position: string
}

export class SendQuoteDto {
  @ApiProperty({ description: "Costo de mano de obra en Soles (debe ser > 0)", example: 150.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: "laborCost debe ser mayor a cero" })
  laborCost: number

  @ApiProperty({ description: "Costo total de repuestos en Soles (puede ser 0 si no hay repuestos)", example: 450.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: "partsCost no puede ser negativo" })
  partsCost: number

  @ApiPropertyOptional({ description: "Dias de validez de la cotizacion (default: 3)", example: 3, minimum: 1, maximum: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  validDays?: number
}

export class ApproveQuoteDto {
  @ApiProperty({ description: "Token de firma digital del cliente (Base64 o confirmacion con timestamp)", example: "APPROVED-uuid-1749380000000" })
  @IsString({ message: "clientSignature es requerida" })
  clientSignature: string
}

export class RejectQuoteDto {
  @ApiProperty({ description: "Motivo del rechazo de la cotizacion por el cliente", example: "El presupuesto supera mi limite" })
  @IsString({ message: "reason es requerida" })
  reason: string
}

export class DeliverOrderDto {
  @ApiProperty({ description: "Firma digital del cliente (conformidad de entrega)", example: "CONF-cliente-uuid-1717800000000" })
  @IsString()
  @MinLength(5)
  clientSignature: string

  @ApiProperty({ description: "Metodo de pago del cliente", enum: ["CASH", "YAPE", "PLIN", "CARD", "TRANSFER"], example: "YAPE" })
  @IsIn(["CASH", "YAPE", "PLIN", "CARD", "TRANSFER"])
  paymentMethod: string
}

export class CompleteWorkOrderDto {
  @ApiProperty({ description: "Kilometraje de salida del vehiculo (debe ser >= odometro de ingreso)", example: 85120 })
  @IsNumber()
  @Min(0, { message: "El odometro de salida no puede ser negativo" })
  odometerOut: number

  @ApiProperty({ description: "Notas tecnicas del trabajo ejecutado", example: "Cambio de pastillas y discos delanteros, purgado de frenos completado" })
  @IsString({ message: "Las notas tecnicas son requeridas" })
  @MinLength(5, { message: "Las notas tecnicas deben tener al menos 5 caracteres" })
  technicalNotes: string

  @ApiPropertyOptional({ description: "Estado solicitado al finalizar (ignorado y forzado a IN_REVIEW si el rol es TRAINEE)", enum: ["READY", "IN_REVIEW"], example: "READY" })
  @IsOptional()
  @IsIn(["READY", "IN_REVIEW"], { message: "requestedStatus debe ser READY o IN_REVIEW" })
  requestedStatus?: "READY" | "IN_REVIEW"
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
