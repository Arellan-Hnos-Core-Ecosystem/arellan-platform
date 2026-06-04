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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const mfa_required_guard_1 = require("../../common/guards/mfa-required.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const audit_dto_1 = require("./dto/audit.dto");
let AuditController = class AuditController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    findAll(filters) { return this.auditService.findAll(filters); }
    getByUser(userId, limit, cursor) {
        return this.auditService.getByUser(userId, limit ? parseInt(limit) : undefined, cursor);
    }
    getByEntity(entity, entityId, limit, cursor) {
        return this.auditService.getByEntity(entity, entityId, limit ? parseInt(limit) : undefined, cursor);
    }
    findOne(id) { return this.auditService.findOne(id); }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Consultar logs de auditoria",
        description: "Listado paginado de logs con filtros por usuario, accion, entidad y rango de fechas. Cada log incluye hash SHA-256 inmutable generado por IntegrityHashService para prevenir manipulaciones. Requiere MFA.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Logs de auditoria paginados" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o MFA no verificado" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo ADMIN u OWNER" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditFilterDto]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    (0, swagger_1.ApiOperation)({ summary: "Logs de auditoria por usuario", description: "Todas las acciones registradas para un usuario especifico." }),
    (0, swagger_1.ApiParam)({ name: "userId", description: "ID del usuario (UUID v4)" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Logs del usuario" }),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)("entity/:entity/:entityId"),
    (0, swagger_1.ApiOperation)({ summary: "Logs por entidad", description: "Auditoria de todas las mutaciones sobre una entidad especifica (ej. orders, finance, inventory)." }),
    (0, swagger_1.ApiParam)({ name: "entity", description: "Nombre de la entidad", example: "orders" }),
    (0, swagger_1.ApiParam)({ name: "entityId", description: "ID de la entidad (UUID v4)" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Logs de la entidad" }),
    __param(0, (0, common_1.Param)("entity")),
    __param(1, (0, common_1.Param)("entityId")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getByEntity", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de un log de auditoria" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del log (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Detalle del log con beforeState/afterState" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Log no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findOne", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)("Audit"),
    (0, common_1.Controller)("audit"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map