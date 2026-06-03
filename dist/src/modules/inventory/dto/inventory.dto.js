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
exports.InventoryMovementDto = exports.UpdateItemDto = exports.CreateItemDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateItemDto {
    sku;
    name;
    category;
    stock;
    minStock;
    unitPrice;
}
exports.CreateItemDto = CreateItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: "SKU es requerido" }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Nombre es requerido" }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "Categoria es requerida" }),
    __metadata("design:type", String)
], CreateItemDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Stock debe ser un numero" }),
    (0, class_validator_1.Min)(0, { message: "Stock no puede ser negativo" }),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Stock minimo debe ser un numero" }),
    (0, class_validator_1.Min)(1, { message: "Stock minimo debe ser al menos 1" }),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "minStock", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Precio unitario debe ser un numero" }),
    (0, class_validator_1.Min)(0.01, { message: "Precio unitario debe ser mayor a cero" }),
    __metadata("design:type", Number)
], CreateItemDto.prototype, "unitPrice", void 0);
class UpdateItemDto {
    sku;
    name;
    category;
    stock;
    minStock;
    unitPrice;
}
exports.UpdateItemDto = UpdateItemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "SKU invalido" }),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Nombre invalido" }),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Categoria invalida" }),
    __metadata("design:type", String)
], UpdateItemDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "Stock debe ser un numero" }),
    (0, class_validator_1.Min)(0, { message: "Stock no puede ser negativo" }),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "Stock minimo debe ser un numero" }),
    (0, class_validator_1.Min)(1, { message: "Stock minimo debe ser al menos 1" }),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "minStock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "Precio unitario debe ser un numero" }),
    (0, class_validator_1.Min)(0.01, { message: "Precio unitario debe ser mayor a cero" }),
    __metadata("design:type", Number)
], UpdateItemDto.prototype, "unitPrice", void 0);
class InventoryMovementDto {
    type;
    quantity;
    orderId;
    justification;
}
exports.InventoryMovementDto = InventoryMovementDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.MovementType, { message: "Tipo de movimiento invalido. Valores: IN, OUT, ADJUSTMENT" }),
    __metadata("design:type", String)
], InventoryMovementDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "Cantidad debe ser un numero" }),
    (0, class_validator_1.Min)(1, { message: "Cantidad debe ser mayor a cero" }),
    __metadata("design:type", Number)
], InventoryMovementDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4", { message: "ID de orden de trabajo invalido" }),
    __metadata("design:type", String)
], InventoryMovementDto.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Justificacion invalida" }),
    __metadata("design:type", String)
], InventoryMovementDto.prototype, "justification", void 0);
//# sourceMappingURL=inventory.dto.js.map