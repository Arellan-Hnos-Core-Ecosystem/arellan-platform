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
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchases_service_1 = require("./purchases.service");
const purchases_dto_1 = require("./dto/purchases.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PurchasesController = class PurchasesController {
    purchasesService;
    constructor(purchasesService) {
        this.purchasesService = purchasesService;
    }
    findAll(filters) { return this.purchasesService.findAll(filters); }
    getImports() { return this.purchasesService.getImports(); }
    getBySupplier(supplierId) { return this.purchasesService.getBySupplier(supplierId); }
    findOne(id) { return this.purchasesService.findOne(id); }
    create(dto, user) { return this.purchasesService.create(dto, user.id); }
    updateStatus(id, dto, user) { return this.purchasesService.updateStatus(id, dto.status, user.id); }
    receiveItems(id, dto, user) { return this.purchasesService.receiveItems(id, dto, user.id); }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar compras", description: "Listado paginado de ordenes de compra con filtros por estado, proveedor y busqueda. Incluye conteo de items." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de compras" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchases_dto_1.PurchaseFilterDto]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("imports"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Compras de importacion", description: "Ordenes de compra marcadas como importadas (isImported=true)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de compras importadas" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "getImports", null);
__decorate([
    (0, common_1.Get)("supplier/:supplierId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Compras por proveedor" }),
    (0, swagger_1.ApiParam)({ name: "supplierId", description: "ID del proveedor (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Compras del proveedor" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Proveedor no encontrado" }),
    __param(0, (0, common_1.Param)("supplierId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "getBySupplier", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de compra", description: "OC con items, proveedor y comisiones asociadas." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la compra (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Compra detallada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Compra no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Crear orden de compra", description: "Genera OC con numero autoincremental (OC-AAAA-NNNN). Calcula subtotal, impuestos, envio y total automaticamente." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "OC creada en estado DRAFT" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [purchases_dto_1.CreatePurchaseDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id/status"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Cambiar estado de compra", description: "Transicion segun maquina de estados: DRAFT->SENT->CONFIRMED->PARTIALLY_RECEIVED->RECEIVED. CANCELLED desde cualquier estado." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la compra (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Estado actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Compra no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Transicion no permitida" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, purchases_dto_1.UpdatePurchaseStatusDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(":id/receive"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Recepcionar items de compra", description: "Registra la recepcion parcial o total de items. Incrementa el stock automaticamente y registra movimientos de inventario. Transiciona a RECEIVED cuando todos los items estan completos." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la compra (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Items recibidos y stock actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Compra o item no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "Cantidad recibida excede la ordenada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, purchases_dto_1.ReceiveItemsDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "receiveItems", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, swagger_1.ApiTags)("Purchases"),
    (0, common_1.Controller)("purchases"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map