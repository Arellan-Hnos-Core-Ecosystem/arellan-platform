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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const commissions_service_1 = require("./commissions.service");
const commissions_dto_1 = require("./dto/commissions.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let CommissionsController = class CommissionsController {
    commissionsService;
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    findAll(filters) { return this.commissionsService.findAll(filters); }
    getByPersonnel(personnelId) { return this.commissionsService.getByPersonnel(personnelId); }
    getBySupplier(supplierId) { return this.commissionsService.getBySupplier(supplierId); }
    create(dto, user) { return this.commissionsService.create(dto, user.role, user.id); }
    approve(id, dto) { return this.commissionsService.approve(id, dto.approverId); }
    pay(id) { return this.commissionsService.pay(id); }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar comisiones", description: "Comisiones con filtros por estado, personal, proveedor y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de comisiones" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commissions_dto_1.CommissionFilterDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("personnel/:personnelId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Comisiones por personal" }),
    (0, swagger_1.ApiParam)({ name: "personnelId", description: "ID del personal (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comisiones del personal" }),
    __param(0, (0, common_1.Param)("personnelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getByPersonnel", null);
__decorate([
    (0, common_1.Get)("supplier/:supplierId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Comisiones por proveedor" }),
    (0, swagger_1.ApiParam)({ name: "supplierId", description: "ID del proveedor (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comisiones del proveedor" }),
    __param(0, (0, common_1.Param)("supplierId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getBySupplier", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Crear comision (OWNER)", description: "Registra una nueva comision para personal o proveedor. Solo OWNER puede crear comisiones." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Comision creada en estado PENDING" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [commissions_dto_1.CreateCommissionDto, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/approve"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Aprobar comision", description: "OWNER o ADMIN aprueban una comision pendiente. Cambia estado a APPROVED." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la comision (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comision aprobada" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER o ADMIN" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Comision no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, commissions_dto_1.ApproveCommissionDto]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(":id/pay"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Pagar comision", description: "Marca la comision como pagada registrando la fecha de pago. Solo comisiones en estado APPROVED." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la comision (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Comision pagada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Comision no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "La comision debe estar aprobada para pagarse" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "pay", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, swagger_1.ApiTags)("Commissions"),
    (0, common_1.Controller)("commissions"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map