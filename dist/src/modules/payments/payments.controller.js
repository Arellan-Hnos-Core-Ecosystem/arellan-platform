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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const payments_dto_1 = require("./dto/payments.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    findAll(filters) { return this.paymentsService.findAll(filters); }
    getTodaySummary() { return this.paymentsService.getTodaySummary(); }
    getByMethod(method, from, to) { return this.paymentsService.getByMethod(method, from, to); }
    getByOrder(orderId) { return this.paymentsService.getByOrder(orderId); }
    create(dto, user) { return this.paymentsService.create(dto, user.id); }
    verify(id, dto) { return this.paymentsService.verify(id, dto.verifierId); }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar pagos", description: "Listado paginado de todos los pagos con filtros por metodo, orden, factura y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de pagos" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.PaymentFilterDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("today"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Resumen de pagos del dia", description: "Total recaudado hoy agrupado por metodo de pago." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen de pagos del dia" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getTodaySummary", null);
__decorate([
    (0, common_1.Get)("method"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Pagos por metodo", description: "Filtra pagos por metodo (YAPE, PLIN, CASH, TRANSFER, CARD) en un rango de fechas." }),
    (0, swagger_1.ApiQuery)({ name: "method", enum: client_1.PaymentMethod, example: "YAPE" }),
    (0, swagger_1.ApiQuery)({ name: "from", description: "Fecha inicio ISO", example: "2026-06-01" }),
    (0, swagger_1.ApiQuery)({ name: "to", description: "Fecha fin ISO", example: "2026-06-30" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Pagos filtrados por metodo" }),
    __param(0, (0, common_1.Query)("method")),
    __param(1, (0, common_1.Query)("from")),
    __param(2, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getByMethod", null);
__decorate([
    (0, common_1.Get)("order/:orderId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Pagos de una orden", description: "Todos los pagos asociados a una OT especifica." }),
    (0, swagger_1.ApiParam)({ name: "orderId", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Pagos de la OT" }),
    __param(0, (0, common_1.Param)("orderId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getByOrder", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Registrar pago",
        description: "Registra un pago asociado a una OT y/o factura. Si isPersonalYape=true, dispara alerta antifraude via WebSocket. Valida que el monto coincida con el saldo pendiente de la OT.",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Pago registrado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "Pago Yape a cuenta personal detectado" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payments_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/verify"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Verificar pago (doble control)", description: "Un segundo usuario verifica y confirma un pago. Requerido para pagos Yape/Plin como medida antifraude." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del pago (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Pago verificado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Pago no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payments_dto_1.VerifyPaymentDto]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verify", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)("Payments"),
    (0, common_1.Controller)("payments"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map