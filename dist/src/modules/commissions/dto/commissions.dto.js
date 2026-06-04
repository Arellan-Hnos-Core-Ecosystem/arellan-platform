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
exports.ApproveCommissionDto = exports.CreateCommissionDto = exports.CommissionFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class CommissionFilterDto {
    status;
    personnelId;
    supplierId;
    from;
    to;
    page;
    limit;
}
exports.CommissionFilterDto = CommissionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ApprovalStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ApprovalStatus),
    __metadata("design:type", String)
], CommissionFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CommissionFilterDto.prototype, "personnelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CommissionFilterDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CommissionFilterDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CommissionFilterDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CommissionFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CommissionFilterDto.prototype, "limit", void 0);
class CreateCommissionDto {
    personnelId;
    supplierId;
    purchaseId;
    type;
    amount;
    percentage;
    notes;
}
exports.CreateCommissionDto = CreateCommissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del personal que recibe la comision (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de personal invalido" }),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "personnelId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID del proveedor asociado (opcional)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de la compra asociada (opcional)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "purchaseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tipo de comision", example: "IMPORT_COMMISSION" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Monto de comision en Soles", example: 350.0 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreateCommissionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Porcentaje de comision", example: 5.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    __metadata("design:type", Number)
], CreateCommissionDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "notes", void 0);
class ApproveCommissionDto {
    approverId;
}
exports.ApproveCommissionDto = ApproveCommissionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del aprobador (UUID v4)", example: "770e8400-e29b-41d4-a716-446655440002" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de aprobador invalido" }),
    __metadata("design:type", String)
], ApproveCommissionDto.prototype, "approverId", void 0);
//# sourceMappingURL=commissions.dto.js.map