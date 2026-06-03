"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MfaRequiredGuard = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const MFA_REQUIRED_ROLES = [client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE];
let MfaRequiredGuard = class MfaRequiredGuard {
    canActivate(context) {
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException("No autenticado");
        }
        if (MFA_REQUIRED_ROLES.includes(user.role) && !user.mfaVerified) {
            throw new common_1.ForbiddenException({
                message: "MFA requerida para este rol",
                code: "MFA_REQUIRED",
            });
        }
        return true;
    }
};
exports.MfaRequiredGuard = MfaRequiredGuard;
exports.MfaRequiredGuard = MfaRequiredGuard = __decorate([
    (0, common_1.Injectable)()
], MfaRequiredGuard);
//# sourceMappingURL=mfa-required.guard.js.map