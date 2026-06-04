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
exports.ExpenseFiltersDto = exports.ApproveExpenseDto = exports.CreateExpenseDto = exports.CreateTransactionDto = exports.CloseCashboxDto = exports.OpenCashboxDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
class OpenCashboxDto {
    openingBalance;
}
exports.OpenCashboxDto = OpenCashboxDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Saldo inicial en efectivo al abrir caja (S/.)", example: 500.0, minimum: 0 }),
    (0, class_validator_1.IsNumber)({}, { message: "El saldo inicial debe ser un numero" }),
    (0, class_validator_1.Min)(0, { message: "El saldo inicial no puede ser negativo" }),
    __metadata("design:type", Number)
], OpenCashboxDto.prototype, "openingBalance", void 0);
class CloseCashboxDto {
    actualCash;
    notes;
}
exports.CloseCashboxDto = CloseCashboxDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Efectivo contado fisicamente al cierre (S/.)", example: 2850.5, minimum: 0 }),
    (0, class_validator_1.IsNumber)({}, { message: "El efectivo real debe ser un numero" }),
    (0, class_validator_1.Min)(0, { message: "El efectivo real no puede ser negativo" }),
    __metadata("design:type", Number)
], CloseCashboxDto.prototype, "actualCash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Notas u observaciones del cierre de caja", example: "Cierre de turno manana - sin novedades" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "Las notas deben ser texto" }),
    __metadata("design:type", String)
], CloseCashboxDto.prototype, "notes", void 0);
class CreateTransactionDto {
    type;
    amount;
    paymentMethod;
    orderId;
    description;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Tipo de transaccion", enum: client_1.TransactionType, example: client_1.TransactionType.PAYMENT }),
    (0, class_validator_1.IsEnum)(client_1.TransactionType, { message: "Tipo de transaccion invalido" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Monto de la transaccion en Soles", example: 150.0 }),
    (0, class_validator_1.IsNumber)({}, { message: "El monto debe ser un numero" }),
    (0, class_validator_1.IsPositive)({ message: "El monto debe ser positivo" }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Metodo de pago utilizado", enum: client_1.PaymentMethod, example: client_1.PaymentMethod.YAPE }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod, { message: "Metodo de pago invalido" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "ID de la orden de trabajo asociada (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "El orderId debe ser texto" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Descripcion o concepto del movimiento", example: "Pago de OT-2026-0001 - Toyota Hilux ABC-123" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "La descripcion debe ser texto" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "description", void 0);
class CreateExpenseDto {
    amount;
    currency = client_1.Currency.PEN;
    category;
    description;
    invoiceUrl;
}
exports.CreateExpenseDto = CreateExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Monto del gasto en Soles (max S/ 100,000)", example: 350.0, minimum: 0.01, maximum: 100000 }),
    (0, class_validator_1.IsNumber)({}, { message: "El monto debe ser un numero" }),
    (0, class_validator_1.IsPositive)({ message: "El monto debe ser positivo" }),
    (0, class_validator_1.Max)(100000, { message: "El monto maximo es 100,000" }),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Moneda del gasto", enum: client_1.Currency, example: client_1.Currency.PEN, default: client_1.Currency.PEN }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Currency, { message: "Moneda invalida" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Categoria del gasto", enum: client_1.ExpenseCategory, example: client_1.ExpenseCategory.PARTS }),
    (0, class_validator_1.IsEnum)(client_1.ExpenseCategory, { message: "Categoria invalida" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Descripcion detallada del gasto (5-500 caracteres)", example: "Compra de filtros de aceite Toyota para stock de inventario", minLength: 5, maxLength: 500 }),
    (0, class_validator_1.IsString)({ message: "La descripcion debe ser texto" }),
    (0, class_validator_1.MinLength)(5, { message: "La descripcion debe tener al menos 5 caracteres" }),
    (0, class_validator_1.MaxLength)(500, { message: "La descripcion no puede exceder 500 caracteres" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "URL de la factura o comprobante escaneado", example: "https://storage.arellan.pe/facturas/exp-001.pdf" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({}, { message: "La URL de la factura no es valida" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "invoiceUrl", void 0);
class ApproveExpenseDto {
    decision;
    rejectionReason;
}
exports.ApproveExpenseDto = ApproveExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Decision sobre el gasto", enum: ["APPROVED", "REJECTED"], example: "APPROVED" }),
    (0, class_validator_1.IsIn)(["APPROVED", "REJECTED"], { message: "La decision debe ser APPROVED o REJECTED" }),
    __metadata("design:type", String)
], ApproveExpenseDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Motivo de rechazo (requerido si decision=REJECTED, min 5 caracteres)", example: "Gasto no justificado - falta factura del proveedor" }),
    (0, class_validator_1.ValidateIf)((o) => o.decision === "REJECTED"),
    (0, class_validator_1.IsString)({ message: "El motivo de rechazo es requerido" }),
    (0, class_validator_1.MinLength)(5, { message: "El motivo de rechazo debe tener al menos 5 caracteres" }),
    __metadata("design:type", String)
], ApproveExpenseDto.prototype, "rejectionReason", void 0);
class ExpenseFiltersDto {
    status;
    category;
    requesterId;
    startDate;
    endDate;
    page = 1;
    size = 20;
}
exports.ExpenseFiltersDto = ExpenseFiltersDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por estado del gasto", example: "PENDING_APPROVAL" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por categoria", example: "PARTS" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Filtrar por ID del solicitante", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "requesterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha inicio del rango (ISO 8601)", example: "2026-06-01T00:00:00.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Fecha fin del rango (ISO 8601)", example: "2026-06-30T23:59:59.000Z" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Numero de pagina (min 1)", example: 1, minimum: 1, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "page debe ser numero" }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExpenseFiltersDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Resultados por pagina (1-100)", example: 20, minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "size debe ser numero" }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ExpenseFiltersDto.prototype, "size", void 0);
//# sourceMappingURL=finance.dto.js.map