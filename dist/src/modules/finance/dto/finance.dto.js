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
class OpenCashboxDto {
    openingBalance;
}
exports.OpenCashboxDto = OpenCashboxDto;
__decorate([
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
    (0, class_validator_1.IsNumber)({}, { message: "El efectivo real debe ser un numero" }),
    (0, class_validator_1.Min)(0, { message: "El efectivo real no puede ser negativo" }),
    __metadata("design:type", Number)
], CloseCashboxDto.prototype, "actualCash", void 0);
__decorate([
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
    (0, class_validator_1.IsEnum)(client_1.TransactionType, { message: "Tipo de transaccion invalido" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: "El monto debe ser un numero" }),
    (0, class_validator_1.IsPositive)({ message: "El monto debe ser positivo" }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod, { message: "Metodo de pago invalido" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: "El orderId debe ser texto" }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "orderId", void 0);
__decorate([
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
    (0, class_validator_1.IsNumber)({}, { message: "El monto debe ser un numero" }),
    (0, class_validator_1.IsPositive)({ message: "El monto debe ser positivo" }),
    (0, class_validator_1.Max)(100000, { message: "El monto maximo es 100,000" }),
    __metadata("design:type", Number)
], CreateExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.Currency, { message: "Moneda invalida" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ExpenseCategory, { message: "Categoria invalida" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: "La descripcion debe ser texto" }),
    (0, class_validator_1.MinLength)(5, { message: "La descripcion debe tener al menos 5 caracteres" }),
    (0, class_validator_1.MaxLength)(500, { message: "La descripcion no puede exceder 500 caracteres" }),
    __metadata("design:type", String)
], CreateExpenseDto.prototype, "description", void 0);
__decorate([
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
    (0, class_validator_1.IsIn)(["APPROVED", "REJECTED"], {
        message: "La decision debe ser APPROVED o REJECTED",
    }),
    __metadata("design:type", String)
], ApproveExpenseDto.prototype, "decision", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.decision === "REJECTED"),
    (0, class_validator_1.IsString)({ message: "El motivo de rechazo es requerido" }),
    (0, class_validator_1.MinLength)(5, {
        message: "El motivo de rechazo debe tener al menos 5 caracteres",
    }),
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
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "requesterId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExpenseFiltersDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "page debe ser numero" }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExpenseFiltersDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: "size debe ser numero" }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ExpenseFiltersDto.prototype, "size", void 0);
//# sourceMappingURL=finance.dto.js.map