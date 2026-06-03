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
    findAll(filters) {
        return this.auditService.findAll(filters);
    }
    getByUser(userId, limit, cursor) {
        return this.auditService.getByUser(userId, limit ? parseInt(limit) : undefined, cursor);
    }
    getByEntity(entity, entityId, limit, cursor) {
        return this.auditService.getByEntity(entity, entityId, limit ? parseInt(limit) : undefined, cursor);
    }
    findOne(id) {
        return this.auditService.findOne(id);
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_dto_1.AuditFilterDto]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("user/:userId"),
    __param(0, (0, common_1.Param)("userId")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Get)("entity/:entity/:entityId"),
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
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findOne", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)("audit"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, mfa_required_guard_1.MfaRequiredGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map