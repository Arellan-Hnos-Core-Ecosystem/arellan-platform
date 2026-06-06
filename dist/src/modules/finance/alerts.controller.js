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
exports.AlertsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AlertsController = class AlertsController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAlerts(page, pageSize) {
        const take = pageSize ? parseInt(pageSize, 10) : 30;
        const skip = page ? (parseInt(page, 10) - 1) * take : 0;
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { severity: { in: [client_1.AuditSeverity.CRITICAL, client_1.AuditSeverity.SECURITY_ALERT] } },
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            this.prisma.auditLog.count({
                where: { severity: { in: [client_1.AuditSeverity.CRITICAL, client_1.AuditSeverity.SECURITY_ALERT] } },
            }),
        ]);
        return { data, total, page: parseInt(page || "1", 10), pageSize: take, totalPages: Math.ceil(total / take) };
    }
    acknowledgeAlert(id) {
        return { success: true, id };
    }
};
exports.AlertsController = AlertsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.FINANCE),
    (0, swagger_1.ApiOperation)({ summary: "Listar alertas del sistema" }),
    __param(0, (0, common_1.Query)("page")),
    __param(1, (0, common_1.Query)("pageSize")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AlertsController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Post)(":id/acknowledge"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: "Reconocer alerta" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AlertsController.prototype, "acknowledgeAlert", null);
exports.AlertsController = AlertsController = __decorate([
    (0, swagger_1.ApiTags)("Alerts"),
    (0, common_1.Controller)("alerts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AlertsController);
//# sourceMappingURL=alerts.controller.js.map