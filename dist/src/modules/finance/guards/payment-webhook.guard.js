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
var PaymentWebhookGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentWebhookGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
let PaymentWebhookGuard = PaymentWebhookGuard_1 = class PaymentWebhookGuard {
    config;
    constructor(config) {
        this.config = config;
    }
    canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const secret = this.config.get("PAYMENT_WEBHOOK_SECRET");
        if (!secret) {
            throw new common_1.ForbiddenException("PAYMENT_WEBHOOK_SECRET no configurado en el servidor");
        }
        const provided = req.headers["x-webhook-signature"];
        const qrToken = req.body?.qrToken;
        if (typeof provided !== "string" || typeof qrToken !== "string" || !qrToken) {
            throw new common_1.UnauthorizedException("Firma de webhook ausente o inválida");
        }
        const expected = (0, crypto_1.createHmac)("sha256", secret).update(qrToken).digest("hex");
        if (!PaymentWebhookGuard_1.safeEqual(provided, expected)) {
            throw new common_1.UnauthorizedException("Firma de webhook inválida");
        }
        return true;
    }
    static safeEqual(a, b) {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(bufA, bufB);
    }
};
exports.PaymentWebhookGuard = PaymentWebhookGuard;
exports.PaymentWebhookGuard = PaymentWebhookGuard = PaymentWebhookGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentWebhookGuard);
//# sourceMappingURL=payment-webhook.guard.js.map