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
exports.RbacGuard = exports.RequirePermissions = exports.PermissionAction = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.PERMISSIONS_KEY = "rbac:permissions";
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["READ"] = "READ";
    PermissionAction["CREATE"] = "CREATE";
    PermissionAction["UPDATE"] = "UPDATE";
    PermissionAction["DELETE"] = "DELETE";
    PermissionAction["APPROVE"] = "APPROVE";
    PermissionAction["FINANCIAL_EXPORT"] = "FINANCIAL_EXPORT";
    PermissionAction["MANAGE_PERSONNEL"] = "MANAGE_PERSONNEL";
    PermissionAction["VIEW_AUDIT_LOGS"] = "VIEW_AUDIT_LOGS";
    PermissionAction["MANAGE_SETTINGS"] = "MANAGE_SETTINGS";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
const ROLE_PERMISSIONS = {
    OWNER: Object.values(PermissionAction),
    ADMIN: [
        PermissionAction.READ,
        PermissionAction.CREATE,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
        PermissionAction.APPROVE,
        PermissionAction.MANAGE_PERSONNEL,
    ],
    FINANCE: [
        PermissionAction.READ,
        PermissionAction.CREATE,
        PermissionAction.UPDATE,
        PermissionAction.APPROVE,
        PermissionAction.FINANCIAL_EXPORT,
    ],
    MECHANIC: [
        PermissionAction.READ,
        PermissionAction.CREATE,
        PermissionAction.UPDATE,
    ],
    TRAINEE: [
        PermissionAction.READ,
        PermissionAction.CREATE,
    ],
    CLIENT: [
        PermissionAction.READ,
    ],
};
const RequirePermissions = (...permissions) => Reflect.metadata(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
let RbacGuard = class RbacGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride(exports.PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new common_1.ForbiddenException({
                message: "No autenticado",
                code: "UNAUTHENTICATED",
            });
        }
        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        const hasAllPermissions = requiredPermissions.every((p) => userPermissions.includes(p));
        if (!hasAllPermissions) {
            throw new common_1.ForbiddenException({
                message: `Permisos insuficientes. Tu rol (${user.role}) no permite esta acción.`,
                code: "INSUFFICIENT_PERMISSIONS",
                required: requiredPermissions,
                granted: userPermissions,
            });
        }
        return true;
    }
};
exports.RbacGuard = RbacGuard;
exports.RbacGuard = RbacGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RbacGuard);
//# sourceMappingURL=rbac.guard.js.map