"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const mfa_enforcement_interceptor_1 = require("../mfa-enforcement.interceptor");
function ctx(user, url) {
    return {
        getType: () => "http",
        switchToHttp: () => ({ getRequest: () => ({ user, originalUrl: url, url }) }),
    };
}
const next = { handle: jest.fn(() => (0, rxjs_1.of)("ok")) };
describe("MfaEnforcementInterceptor (SEC-05-bis)", () => {
    const interceptor = new mfa_enforcement_interceptor_1.MfaEnforcementInterceptor();
    beforeEach(() => next.handle.mockClear());
    it("blocks a privileged user without verified MFA on any business route", () => {
        expect(() => interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/finance/expenses"), next)).toThrow(common_1.ForbiddenException);
        expect(() => interceptor.intercept(ctx({ role: "ADMIN", mfaVerified: false }, "/api/v1/orders"), next)).toThrow(common_1.ForbiddenException);
    });
    it("blocks reads too (privileged access fully gated)", () => {
        expect(() => interceptor.intercept(ctx({ role: "FINANCE", mfaVerified: false }, "/api/v1/audit"), next)).toThrow(common_1.ForbiddenException);
    });
    it("allows the MFA enrollment and session-management routes", () => {
        for (const path of [
            "/api/v1/auth/mfa/generate",
            "/api/v1/auth/mfa/confirm",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout",
            "/api/v1/auth/logout-all",
            "/api/v1/auth/me",
            "/api/v1/auth/sessions",
            "/api/v1/auth/sessions/abc-123",
        ]) {
            expect(() => interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, path), next)).not.toThrow();
        }
    });
    it("does NOT exempt account creation or force-logout under /auth", () => {
        expect(() => interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/auth/register"), next)).toThrow(common_1.ForbiddenException);
        expect(() => interceptor.intercept(ctx({ role: "OWNER", mfaVerified: false }, "/api/v1/auth/force-logout"), next)).toThrow(common_1.ForbiddenException);
    });
    it("lets a privileged user WITH verified MFA through", () => {
        expect(() => interceptor.intercept(ctx({ role: "OWNER", mfaVerified: true }, "/api/v1/finance/expenses"), next)).not.toThrow();
    });
    it("ignores non-privileged roles and unauthenticated requests", () => {
        expect(() => interceptor.intercept(ctx({ role: "MECHANIC", mfaVerified: true }, "/api/v1/orders/my"), next)).not.toThrow();
        expect(() => interceptor.intercept(ctx(undefined, "/api/v1/public/orders/lookup"), next)).not.toThrow();
    });
});
//# sourceMappingURL=mfa-enforcement.interceptor.spec.js.map