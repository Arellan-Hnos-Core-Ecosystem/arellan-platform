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
exports.OrderFilterDto = exports.ApplyDiscountDto = exports.AssignMechanicDto = exports.UpdateStatusDto = exports.UpdateOrderDto = exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
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
//# sourceMappingURL=orders.dto.js.map