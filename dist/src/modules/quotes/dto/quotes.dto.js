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
exports.RejectQuoteDto = exports.CreateQuoteDto = exports.QuoteFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class QuoteFilterDto {
    status;
    clientId;
    search;
    from;
    to;
    page;
    limit;
}
exports.QuoteFilterDto = QuoteFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.QuoteStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.QuoteStatus),
    __metadata("design:type", String)
], QuoteFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID del cliente" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], QuoteFilterDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuoteFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QuoteFilterDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QuoteFilterDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QuoteFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QuoteFilterDto.prototype, "limit", void 0);
class CreateQuoteDto {
    clientId;
    workOrderId;
    validUntil;
    notes;
}
exports.CreateQuoteDto = CreateQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del cliente (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID de cliente invalido" }),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de OT vinculada (opcional)", example: "660e8400-e29b-41d4-a716-446655440001" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "workOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Fecha de validez de la cotizacion (ISO)", example: "2026-07-15T18:00:00.000Z" }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas de la cotizacion", example: "Incluye repuestos originales y mano de obra con garantia de 90 dias" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuoteDto.prototype, "notes", void 0);
class RejectQuoteDto {
    reason;
}
exports.RejectQuoteDto = RejectQuoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Motivo del rechazo", example: "Cliente no acepta el presupuesto - solicita revision de precios" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectQuoteDto.prototype, "reason", void 0);
//# sourceMappingURL=quotes.dto.js.map