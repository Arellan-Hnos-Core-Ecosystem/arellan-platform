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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
const payment_webhook_guard_1 = require("./guards/payment-webhook.guard");
let PaymentWebhookController = class PaymentWebhookController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    async confirmPayment(body) {
        if (!body.qrToken)
            throw new common_1.BadRequestException("qrToken es requerido");
        return this.financeService.confirmPaymentWebhook(body.qrToken, body.paymentMethod || "DYNAMIC_QR", body.reference);
    }
};
exports.PaymentWebhookController = PaymentWebhookController;
__decorate([
    (0, common_1.Post)("payment/confirm"),
    (0, common_1.UseGuards)(payment_webhook_guard_1.PaymentWebhookGuard),
    (0, swagger_1.ApiHeader)({
        name: "x-webhook-signature",
        description: "HMAC-SHA256 hex del qrToken firmado con PAYMENT_WEBHOOK_SECRET",
        required: true,
    }),
    (0, swagger_1.ApiOperation)({
        summary: "Confirmar pago (webhook firmado)",
        description: "Confirma un pago asociado a un qrToken vigente. Requiere firma HMAC-SHA256 del qrToken en el header x-webhook-signature. Idempotente por qrToken.",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Pago confirmado o ya procesado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "qrToken ausente, expirado o inválido" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "Firma de webhook ausente o inválida" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "PAYMENT_WEBHOOK_SECRET no configurado" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentWebhookController.prototype, "confirmPayment", null);
exports.PaymentWebhookController = PaymentWebhookController = __decorate([
    (0, swagger_1.ApiTags)("Finance"),
    (0, common_1.Controller)("webhooks"),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], PaymentWebhookController);
//# sourceMappingURL=payment-webhook.controller.js.map