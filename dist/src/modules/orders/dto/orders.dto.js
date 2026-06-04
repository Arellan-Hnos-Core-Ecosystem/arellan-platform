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
class CreateOrderDto {
    vehicleId;
    clientId;
    mechanicId;
    description;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de vehiculo invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "vehicleId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de cliente invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)("4", { message: "ID de mecanico invalido" }),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "mechanicId", void 0);
__decorate([
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "diagnosis", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Costo de mano de obra invalido" }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "laborCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Costo de repuestos invalido" }),
    __metadata("design:type", Number)
], UpdateOrderDto.prototype, "partsCost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha de entrega estimada invalida" }),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "estimatedDelivery", void 0);
class UpdateStatusDto {
    status;
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
class AssignMechanicDto {
    mechanicId;
}
exports.AssignMechanicDto = AssignMechanicDto;
__decorate([
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Monto de descuento invalido" }),
    __metadata("design:type", Number)
], ApplyDiscountDto.prototype, "discountAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }, { message: "Porcentaje de descuento invalido" }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ApplyDiscountDto.prototype, "discountPercentage", void 0);
__decorate([
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.OrderStatus, { message: "Estado de orden invalido" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4", { message: "ID de mecanico invalido" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "mechanicId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha desde invalida" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: "Fecha hasta invalida" }),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1, { message: "Limite minimo es 1" }),
    (0, class_validator_1.Max)(100, { message: "Limite maximo es 100" }),
    __metadata("design:type", Number)
], OrderFilterDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderFilterDto.prototype, "cursor", void 0);
//# sourceMappingURL=orders.dto.js.map