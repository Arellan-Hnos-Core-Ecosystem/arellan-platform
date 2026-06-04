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
exports.QuotesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const quotes_service_1 = require("./quotes.service");
const quotes_dto_1 = require("./dto/quotes.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let QuotesController = class QuotesController {
    quotesService;
    constructor(quotesService) {
        this.quotesService = quotesService;
    }
    findAll(filters) { return this.quotesService.findAll(filters); }
    findOne(id) { return this.quotesService.findOne(id); }
    create(dto, user) { return this.quotesService.create(dto, user.id); }
    approve(id) { return this.quotesService.approve(id); }
    reject(id, dto) { return this.quotesService.reject(id, dto.reason); }
    convertToOrder(id, user) { return this.quotesService.convertToOrder(id, user.id); }
};
exports.QuotesController = QuotesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Listar cotizaciones", description: "Listado paginado con filtros por estado, cliente y rango de fechas." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de cotizaciones" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotes_dto_1.QuoteFilterDto]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de cotizacion" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cotizacion (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cotizacion detallada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cotizacion no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Crear cotizacion", description: "Genera una cotizacion en estado DRAFT con numero autoincremental. Opcionalmente vinculada a una OT." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Cotizacion creada" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quotes_dto_1.CreateQuoteDto, Object]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(":id/approve"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Aprobar cotizacion" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cotizacion (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cotizacion aprobada" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cotizacion no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(":id/reject"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Rechazar cotizacion" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cotizacion (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cotizacion rechazada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, quotes_dto_1.RejectQuoteDto]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(":id/convert"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Convertir cotizacion a OT", description: "Convierte una cotizacion aprobada en una Orden de Trabajo activa. Transfiere datos del cliente y crea la OT en estado RECEIVED." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la cotizacion (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "OT creada desde cotizacion" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Cotizacion no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "Cotizacion debe estar aprobada para convertir" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuotesController.prototype, "convertToOrder", null);
exports.QuotesController = QuotesController = __decorate([
    (0, swagger_1.ApiTags)("Quotes"),
    (0, common_1.Controller)("quotes"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [quotes_service_1.QuotesService])
], QuotesController);
//# sourceMappingURL=quotes.controller.js.map