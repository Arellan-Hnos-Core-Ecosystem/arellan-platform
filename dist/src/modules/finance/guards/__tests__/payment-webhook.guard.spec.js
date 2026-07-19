"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const payment_webhook_guard_1 = require("../payment-webhook.guard");
const SECRET = "test-webhook-secret";
function ctx(headers, body) {
    return {
        switchToHttp: () => ({ getRequest: () => ({ headers, body }) }),
    };
}
function sign(token, secret = SECRET) {
    return (0, crypto_1.createHmac)("sha256", secret).update(token).digest("hex");
}
function guardWith(secret) {
    const config = { get: jest.fn().mockReturnValue(secret) };
    return new payment_webhook_guard_1.PaymentWebhookGuard(config);
}
describe("PaymentWebhookGuard (SEC-03)", () => {
    it("fails closed (Forbidden) when PAYMENT_WEBHOOK_SECRET is not configured", () => {
        expect(() => guardWith(undefined).canActivate(ctx({ "x-webhook-signature": "abc" }, { qrToken: "t" }))).toThrow(common_1.ForbiddenException);
    });
    it("rejects a request with no signature header", () => {
        expect(() => guardWith(SECRET).canActivate(ctx({}, { qrToken: "tok-1" }))).toThrow(common_1.UnauthorizedException);
    });
    it("rejects a request with no qrToken in the body", () => {
        expect(() => guardWith(SECRET).canActivate(ctx({ "x-webhook-signature": sign("tok-1") }, {}))).toThrow(common_1.UnauthorizedException);
    });
    it("rejects a forged signature (wrong secret)", () => {
        expect(() => guardWith(SECRET).canActivate(ctx({ "x-webhook-signature": sign("tok-1", "wrong-secret") }, { qrToken: "tok-1" }))).toThrow(common_1.UnauthorizedException);
    });
    it("rejects a valid signature bound to a different token (no cross-token replay)", () => {
        expect(() => guardWith(SECRET).canActivate(ctx({ "x-webhook-signature": sign("other-token") }, { qrToken: "tok-1" }))).toThrow(common_1.UnauthorizedException);
    });
    it("accepts a correctly signed qrToken", () => {
        expect(guardWith(SECRET).canActivate(ctx({ "x-webhook-signature": sign("tok-1") }, { qrToken: "tok-1" }))).toBe(true);
    });
});
//# sourceMappingURL=payment-webhook.guard.spec.js.map