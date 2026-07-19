"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaEnforcementInterceptor = void 0;
const common_1 = require("@nestjs/common");
const PRIVILEGED_ROLES = ["OWNER", "ADMIN", "FINANCE"];
const AUTH_EXEMPT_SUFFIXES = [
    "/auth/login",
    "/auth/mechanic/login",
    "/auth/mfa/verify",
    "/auth/mfa/generate",
    "/auth/mfa/confirm",
    "/auth/refresh",
    "/auth/logout",
    "/auth/logout-all",
    "/auth/me",
];
let MfaEnforcementInterceptor = class MfaEnforcementInterceptor {
    intercept(context, next) {
        if (context.getType() !== "http")
            return next.handle();
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if (user && PRIVILEGED_ROLES.includes(String(user.role)) && user.mfaVerified !== true) {
            const path = String(req.originalUrl ?? req.url).split("?")[0];
            const isSessionRoute = AUTH_EXEMPT_SUFFIXES.some((s) => path.endsWith(s)) ||
                /\/auth\/sessions(\/[^/]+)?$/.test(path);
            if (!isSessionRoute) {
                throw new common_1.ForbiddenException({
                    message: "Tu rol requiere MFA activa y verificada. Completa el enrolamiento TOTP (/auth/mfa/generate + /auth/mfa/confirm) e inicia sesion con tu codigo.",
                    code: "MFA_ENROLLMENT_REQUIRED",
                });
            }
        }
        return next.handle();
    }
};
exports.MfaEnforcementInterceptor = MfaEnforcementInterceptor;
exports.MfaEnforcementInterceptor = MfaEnforcementInterceptor = __decorate([
    (0, common_1.Injectable)()
], MfaEnforcementInterceptor);
//# sourceMappingURL=mfa-enforcement.interceptor.js.map