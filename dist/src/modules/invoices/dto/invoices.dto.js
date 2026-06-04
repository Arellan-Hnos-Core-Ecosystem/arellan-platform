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
exports.IssueInvoiceDto = exports.CancelInvoiceDto = exports.CreateInvoiceDto = exports.InvoiceFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class InvoiceFilterDto {
    status;
    clientId;
    search;
    from;
    to;
    page;
    limit;
}
exports.InvoiceFilterDto = InvoiceFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por estado", enum: client_1.InvoiceStatus, example: client_1.InvoiceStatus.ISSUED }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.InvoiceStatus),
    __metadata("design:type", String)
], InvoiceFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por ID del cliente" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], InvoiceFilterDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Busqueda por numero o concepto" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha inicio ISO" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InvoiceFilterDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha fin ISO" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], InvoiceFilterDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InvoiceFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], InvoiceFilterDto.prototype, "limit", void 0);
class CreateInvoiceDto {
    clientId;
    workOrderId;
    type;
    notes;
    dueDate;
    includeTax;
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del cliente (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID del cliente invalido" }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de OT vinculada" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "workOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Tipo de comprobante", enum: client_1.InvoiceType, example: client_1.InvoiceType.FACTURA }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.InvoiceType),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas de la factura" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha de vencimiento (ISO)", example: "2026-07-15T18:00:00.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Incluir IGV en el calculo", example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateInvoiceDto.prototype, "includeTax", void 0);
class CancelInvoiceDto {
    reason;
}
exports.CancelInvoiceDto = CancelInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Motivo de anulacion de la factura", example: "Error en monto facturado - se emitira nota de credito" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelInvoiceDto.prototype, "reason", void 0);
class IssueInvoiceDto {
    notes;
}
exports.IssueInvoiceDto = IssueInvoiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas al emitir" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IssueInvoiceDto.prototype, "notes", void 0);
//# sourceMappingURL=invoices.dto.js.map