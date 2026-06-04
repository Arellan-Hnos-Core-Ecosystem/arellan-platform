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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invoices_service_1 = require("./invoices.service");
const invoices_dto_1 = require("./dto/invoices.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    findAll(filters) { return this.invoicesService.findAll(filters); }
    getOverdue() { return this.invoicesService.getOverdue(); }
    getByClient(clientId) { return this.invoicesService.getByClient(clientId); }
    findOne(id) { return this.invoicesService.findOne(id); }
    createFromOrder(orderId, user) { return this.invoicesService.createFromOrder(orderId, user.id); }
    issue(id, user) { return this.invoicesService.issue(id, user.id); }
    cancel(id, dto) { return this.invoicesService.cancel(id, dto.reason); }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar facturas", description: "Listado paginado con filtros por estado, cliente, busqueda y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de facturas" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [invoices_dto_1.InvoiceFilterDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("overdue"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Facturas vencidas", description: "Facturas con estado OVERDUE (fecha de vencimiento superada sin pago completo)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de facturas vencidas" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)("client/:clientId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Facturas por cliente" }),
    (0, swagger_1.ApiParam)({ name: "clientId", description: "ID del cliente (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Facturas del cliente" }),
    __param(0, (0, common_1.Param)("clientId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getByClient", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de factura", description: "Factura completa con pagos asociados y datos del cliente." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la factura (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Factura detallada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Factura no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)("from-order/:orderId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Generar factura desde OT", description: "Crea una factura automaticamente con los datos de la OT: repuestos, mano de obra, descuentos e impuestos." }),
    (0, swagger_1.ApiParam)({ name: "orderId", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Factura generada desde OT" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    __param(0, (0, common_1.Param)("orderId")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "createFromOrder", null);
__decorate([
    (0, common_1.Post)(":id/issue"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Emitir factura", description: "Cambia el estado de DRAFT a ISSUED y registra la fecha de emision." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la factura (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Factura emitida" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Factura no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "La factura ya fue emitida o cancelada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "issue", null);
__decorate([
    (0, common_1.Post)(":id/cancel"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Anular factura", description: "Cancela una factura con motivo. Solo OWNER o ADMIN." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la factura (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Factura anulada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Factura no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invoices_dto_1.CancelInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "cancel", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)("Invoices"),
    (0, common_1.Controller)("invoices"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map