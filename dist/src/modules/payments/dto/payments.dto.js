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
exports.VerifyPaymentDto = exports.CreatePaymentDto = exports.PaymentFilterDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class PaymentFilterDto {
    method;
    orderId;
    invoiceId;
    from;
    to;
    search;
    page;
    limit;
}
exports.PaymentFilterDto = PaymentFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por metodo de pago", enum: client_1.PaymentMethod, example: client_1.PaymentMethod.YAPE }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por ID de OT" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por ID de factura" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "invoiceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha inicio ISO", example: "2026-06-01" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha fin ISO", example: "2026-06-30" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Busqueda por referencia" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Numero de pagina", example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaymentFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Resultados por pagina", example: 20, minimum: 1, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaymentFilterDto.prototype, "limit", void 0);
class CreatePaymentDto {
    invoiceId;
    workOrderId;
    method;
    amount;
    reference;
    channel;
    isPersonalYape;
    yapeAccount;
    notes;
    receiptUrl;
    paidAt;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de factura asociada (UUID v4)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "invoiceId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de orden de trabajo asociada (UUID v4)" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)("4"),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "workOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Metodo de pago", enum: client_1.PaymentMethod, example: client_1.PaymentMethod.YAPE }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod, { message: "Metodo de pago invalido" }),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Monto del pago en Soles", example: 450.0, minimum: 0.01 }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Referencia o numero de operacion", example: "OP-001234567" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Canal de pago", enum: client_1.PaymentChannel, example: client_1.PaymentChannel.IN_PERSON }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentChannel),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Indica si el pago se recibio en Yape personal (dispara alerta antifraude)", example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePaymentDto.prototype, "isPersonalYape", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Numero de cuenta Yape (si es personal)", example: "987654321" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "yapeAccount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas del pago" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "URL del comprobante" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "receiptUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha del pago (ISO)", example: "2026-06-15T14:30:00.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "paidAt", void 0);
class VerifyPaymentDto {
    verifierId;
}
exports.VerifyPaymentDto = VerifyPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "ID del usuario que verifica el pago (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsUUID)("4", { message: "ID del verificador invalido" }),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "verifierId", void 0);
//# sourceMappingURL=payments.dto.js.map