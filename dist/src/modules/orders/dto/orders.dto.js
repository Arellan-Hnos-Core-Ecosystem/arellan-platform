"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MechanicProgressDto = exports.CompleteWorkOrderDto = exports.DeliverOrderDto = exports.RejectQuoteDto = exports.ApproveQuoteDto = exports.SendQuoteDto = exports.RequestCameraCaptureDto = exports.CameraCaptureDto = exports.VehicleCheckinDto = exports.RequestPartsDto = exports.RequestPartsItemDto = exports.OrderFilterDto = exports.ApplyDiscountDto = exports.AssignMechanicDto = exports.UpdateStatusDto = exports.UpdateOrderDto = exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CreateOrderDto {
    vehicleId;
    clientId;
    mechanicId;
    description;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del vehiculo (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de vehiculo invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del cliente propietario del vehiculo (UUID v4)", example: "660e8400-e29b-41d4-a716-446655440001" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de cliente invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del mecanico asignado (UUID v4 de la cuenta)", example: "770e8400-e29b-41d4-a716-446655440002" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de mecanico invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "mechanicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Descripcion del trabajo solicitado por el cliente", example: "Cambio de aceite y filtros, revision de frenos delanteros" }),
    (0, class_validator_1.IsString)({ message: "La descripcion es requerida" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "description", void 0);
class UpdateOrderDto {
    status;
    diagnosis;
    laborCost;
    partsCost;
    estimatedDelivery;
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nuevo estado de la orden segun flujo de trabajo", enum: client_1.OrderStatus, example: client_1.OrderStatus.IN_PROGRESS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Diagnostico tecnico del mecanico", example: "Pastillas de freno delanteras desgastadas al 90%, discos con rayado leve" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "diagnosis", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Costo de mano de obra en Soles", example: 150.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Costo de mano de obra invalido" }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Costo total de repuestos en Soles", example: 450.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Costo de repuestos invalido" }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "partsCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha estimada de entrega (ISO 8601)", example: "2026-06-15T18:00:00.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha de entrega estimada invalida" }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "estimatedDelivery", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Nuevo estado al que se desea transicionar", enum: client_1.OrderStatus, example: client_1.OrderStatus.IN_PROGRESS }),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class AssignMechanicDto {
    mechanicId;
}
exports.AssignMechanicDto = AssignMechanicDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del mecanico a reasignar (UUID v4)", example: "880e8400-e29b-41d4-a716-446655440003" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de mecanico invalido" }),
    __metadata("design:type", String)
], AssignMechanicDto.prototype, "mechanicId", void 0);
class ApplyDiscountDto {
    discountAmount;
    discountPercentage;
    reason;
}
exports.ApplyDiscountDto = ApplyDiscountDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Monto fijo de descuento en Soles", example: 50.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Monto de descuento invalido" }),
    __metadata("design:type", Number)
], ApplyDiscountDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Porcentaje de descuento (0-100)", example: 10, minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Porcentaje de descuento invalido" }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ApplyDiscountDto.prototype, "discountPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Razon comercial del descuento", example: "Cliente frecuente - descuento por fidelidad" }),
    (0, class_validator_1.IsString)({ message: "Razon del descuento requerida" }),
    __metadata("design:type", String)
], ApplyDiscountDto.prototype, "reason", void 0);
class OrderFilterDto {
    status;
    mechanicId;
    from;
    to;
    limit;
    cursor;
    page;
    pageSize;
}
exports.OrderFilterDto = OrderFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por estado de orden", enum: client_1.OrderStatus, example: client_1.OrderStatus.IN_PROGRESS }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por ID del mecanico asignado", example: "990e8400-e29b-41d4-a716-446655440004" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4", { message: "ID de mecanico invalido" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "mechanicId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha de inicio del rango (ISO 8601)", example: "2026-06-01T00:00:00.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha desde invalida" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha de fin del rango (ISO 8601)", example: "2026-06-30T23:59:59.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha hasta invalida" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Cantidad de resultados por pagina (1-100)", example: 20, minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "Limite minimo es 1" }),
    (0, class_validator_1.Max)(100, { message: "Limite maximo es 100" }),
    __metadata("design:type", Number)
], OrderFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Cursor para paginacion (ID del ultimo elemento de la pagina anterior)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "cursor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Numero de pagina para paginacion offset (min 1)", example: 1, minimum: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], OrderFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Resultados por pagina para paginacion offset (1-100)", example: 10, minimum: 1, maximum: 100 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], OrderFilterDto.prototype, "pageSize", void 0);
class RequestPartsItemDto {
    itemId;
    quantity;
}
exports.RequestPartsItemDto = RequestPartsItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del item de inventario (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de item invalido" }),
    __metadata("design:type", String)
], RequestPartsItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Cantidad a solicitar (1-99)", example: 2, minimum: 1, maximum: 99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "Minimo 1 unidad" }),
    (0, class_validator_1.Max)(99, { message: "Maximo 99 unidades" }),
    __metadata("design:type", Number)
], RequestPartsItemDto.prototype, "quantity", void 0);
class RequestPartsDto {
    items;
}
exports.RequestPartsDto = RequestPartsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Items de inventario a solicitar para la OT", type: [RequestPartsItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RequestPartsItemDto),
    __metadata("design:type", Array)
], RequestPartsDto.prototype, "items", void 0);
class VehicleCheckinDto {
    plate;
    brand;
    model;
    kilometerReading;
    fuelLevel;
    description;
    photoPositions;
}
exports.VehicleCheckinDto = VehicleCheckinDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Placa del vehiculo (formato peruano ABC-123)", example: "ABC-123" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Z]{3}-\d{3}$/i, { message: "Placa invalida. Formato requerido: ABC-123" }),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "plate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Marca del vehiculo", example: "Toyota" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Modelo del vehiculo", example: "Hiace" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Lectura actual del kilometraje", example: "85000" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "kilometerReading", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Nivel de combustible", enum: ["EMPTY", "QUARTER", "HALF", "THREE_QUARTERS", "FULL"] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "fuelLevel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Descripcion del trabajo a realizar", example: "Cambio de aceite y filtros" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Posiciones de fotos separadas por coma (FRONT,BACK,LEFT,RIGHT,DASHBOARD)", example: "FRONT,BACK,LEFT,RIGHT,DASHBOARD" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleCheckinDto.prototype, "photoPositions", void 0);
class CameraCaptureDto {
    position;
    cameraId;
    imageBase64;
    mimeType;
}
exports.CameraCaptureDto = CameraCaptureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Posicion de check-in vinculada (Regla Anti-Fraude #8)", enum: ["FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD"], example: "FRONT" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CameraCaptureDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Identificador de la camara ONVIF de origen", example: "CAM-BAHIA-01" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CameraCaptureDto.prototype, "cameraId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Imagen capturada (snapshot ONVIF) en base64, sin prefijo data URI" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(8_000_000, { message: "La imagen excede el tamaño máximo permitido" }),
    __metadata("design:type", String)
], CameraCaptureDto.prototype, "imageBase64", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "MIME type de la imagen", example: "image/jpeg" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CameraCaptureDto.prototype, "mimeType", void 0);
class RequestCameraCaptureDto {
    position;
}
exports.RequestCameraCaptureDto = RequestCameraCaptureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Posicion de check-in a capturar via camara ONVIF de bahia (Regla Anti-Fraude #8)", enum: ["FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD"], example: "FRONT" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestCameraCaptureDto.prototype, "position", void 0);
class SendQuoteDto {
    laborCost;
    partsCost;
    validDays;
}
exports.SendQuoteDto = SendQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Costo de mano de obra en Soles (debe ser > 0)", example: 150.0 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01, { message: "laborCost debe ser mayor a cero" }),
    __metadata("design:type", Number)
], SendQuoteDto.prototype, "laborCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Costo total de repuestos en Soles (puede ser 0 si no hay repuestos)", example: 450.0 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0, { message: "partsCost no puede ser negativo" }),
    __metadata("design:type", Number)
], SendQuoteDto.prototype, "partsCost", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Dias de validez de la cotizacion (default: 3)", example: 3, minimum: 1, maximum: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(30),
    __metadata("design:type", Number)
], SendQuoteDto.prototype, "validDays", void 0);
class ApproveQuoteDto {
    clientSignature;
}
exports.ApproveQuoteDto = ApproveQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Token de firma digital del cliente (Base64 o confirmacion con timestamp)", example: "APPROVED-uuid-1749380000000" }),
    (0, class_validator_1.IsString)({ message: "clientSignature es requerida" }),
    __metadata("design:type", String)
], ApproveQuoteDto.prototype, "clientSignature", void 0);
class RejectQuoteDto {
    reason;
}
exports.RejectQuoteDto = RejectQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Motivo del rechazo de la cotizacion por el cliente", example: "El presupuesto supera mi limite" }),
    (0, class_validator_1.IsString)({ message: "reason es requerida" }),
    __metadata("design:type", String)
], RejectQuoteDto.prototype, "reason", void 0);
class DeliverOrderDto {
    clientSignature;
    paymentMethod;
}
exports.DeliverOrderDto = DeliverOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Firma digital del cliente (conformidad de entrega)", example: "CONF-cliente-uuid-1717800000000" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], DeliverOrderDto.prototype, "clientSignature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Metodo de pago del cliente", enum: ["CASH", "YAPE", "PLIN", "CARD", "TRANSFER"], example: "YAPE" }),
    (0, class_validator_1.IsIn)(["CASH", "YAPE", "PLIN", "CARD", "TRANSFER"]),
    __metadata("design:type", String)
], DeliverOrderDto.prototype, "paymentMethod", void 0);
class CompleteWorkOrderDto {
    odometerOut;
    technicalNotes;
    requestedStatus;
}
exports.CompleteWorkOrderDto = CompleteWorkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Kilometraje de salida del vehiculo (debe ser >= odometro de ingreso)", example: 85120 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "El odometro de salida no puede ser negativo" }),
    __metadata("design:type", Number)
], CompleteWorkOrderDto.prototype, "odometerOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Notas tecnicas del trabajo ejecutado", example: "Cambio de pastillas y discos delanteros, purgado de frenos completado" }),
    (0, class_validator_1.IsString)({ message: "Las notas tecnicas son requeridas" }),
    (0, class_validator_1.MinLength)(5, { message: "Las notas tecnicas deben tener al menos 5 caracteres" }),
    __metadata("design:type", String)
], CompleteWorkOrderDto.prototype, "technicalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Estado solicitado al finalizar (ignorado y forzado a IN_REVIEW si el rol es TRAINEE)", enum: ["READY", "IN_REVIEW"], example: "READY" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(["READY", "IN_REVIEW"], { message: "requestedStatus debe ser READY o IN_REVIEW" }),
    __metadata("design:type", String)
], CompleteWorkOrderDto.prototype, "requestedStatus", void 0);
class MechanicProgressDto {
    progressPercent;
    partsInstalled;
    laborHours;
    notes;
}
exports.MechanicProgressDto = MechanicProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Porcentaje de avance (0-100)", example: 75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], MechanicProgressDto.prototype, "progressPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Cantidad de repuestos instalados", example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MechanicProgressDto.prototype, "partsInstalled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Horas de trabajo invertidas", example: 2.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MechanicProgressDto.prototype, "laborHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas descriptivas del avance", example: "Reparacion de frenos al 80%, falta purgado" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MechanicProgressDto.prototype, "notes", void 0);
//# sourceMappingURL=orders.dto.js.map