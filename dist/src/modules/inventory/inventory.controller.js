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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const inventory_dto_1 = require("./dto/inventory.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    getAllMovements(itemId, type, limit, cursor) {
        return this.inventoryService.getAllMovements(itemId, type, limit ? parseInt(limit, 10) : undefined, cursor);
    }
    getCriticalStock() {
        return this.inventoryService.getCriticalStock();
    }
    getLowStock() {
        return this.inventoryService.getCriticalStock();
    }
    getValuation() {
        return this.inventoryService.getValuation();
    }
    findAll(category, lowStock, limit, cursor, search, page, pageSize) {
        return this.inventoryService.findAll(category, lowStock === "true", limit ? parseInt(limit, 10) : undefined, cursor, search, page ? parseInt(page, 10) : undefined, pageSize ? parseInt(pageSize, 10) : undefined);
    }
    findOne(id) {
        return this.inventoryService.findOne(id);
    }
    create(dto) {
        return this.inventoryService.create(dto);
    }
    update(id, dto) {
        return this.inventoryService.update(id, dto);
    }
    addMovement(user, id, dto) {
        return this.inventoryService.addMovement(user.id, id, dto);
    }
    getMovements(id, limit, cursor) {
        return this.inventoryService.getMovements(id, limit ? parseInt(limit, 10) : undefined, cursor);
    }
    reserveForOrder(itemId, body, user) {
        return this.inventoryService.reserveForOrder(itemId, body.quantity, body.workOrderId, user.id);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)("movements"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({ summary: "Consultar todos los movimientos", description: "Listado paginado de movimientos de inventario con filtros opcionales por item y tipo." }),
    (0, swagger_1.ApiQuery)({ name: "itemId", description: "Filtrar por ID de item", required: false }),
    (0, swagger_1.ApiQuery)({ name: "type", description: "Filtrar por tipo: IN, OUT, ADJUSTMENT", required: false }),
    (0, swagger_1.ApiQuery)({ name: "limit", description: "Resultados por pagina", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", description: "Cursor de paginacion", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado de movimientos" }),
    __param(0, (0, common_1.Query)("itemId")),
    __param(1, (0, common_1.Query)("type")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getAllMovements", null);
__decorate([
    (0, common_1.Get)("critical/list"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({ summary: "Listar items con stock critico", description: "Items cuyo stock actual es menor o igual al stock minimo configurado. Cache Redis (TTL 60s)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Lista de items criticos ordenados por stock ascendente" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getCriticalStock", null);
__decorate([
    (0, common_1.Get)("low-stock"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({ summary: "Alertas de stock bajo", description: "Alias de critical/list para compatibilidad con dashboard." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Items con stock bajo" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)("valuation"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({ summary: "Valorizacion del inventario", description: "Calcula: total de items activos, valor total a costo, valor total a precio de venta y cantidad de items con stock bajo. Cache Redis (TTL 120s)." }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen de valorizacion del inventario" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getValuation", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, swagger_1.ApiOperation)({ summary: "Listar catalogo de inventario", description: "Catalogo paginado con filtro por categoria. Soporta modo lowStock para ver solo items bajo minimo. Cache Redis Cache-Aside (TTL 120s)." }),
    (0, swagger_1.ApiQuery)({ name: "category", description: "Filtrar por ID de categoria", required: false }),
    (0, swagger_1.ApiQuery)({ name: "lowStock", description: "Solo items con stock bajo (true/false)", required: false, example: "false" }),
    (0, swagger_1.ApiQuery)({ name: "limit", description: "Resultados por pagina", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", description: "Cursor de paginacion", required: false }),
    (0, swagger_1.ApiQuery)({ name: "search", description: "Busqueda insensible por nombre o SKU", required: false, example: "Faro" }),
    (0, swagger_1.ApiQuery)({ name: "page", description: "Numero de pagina (modo offset)", required: false }),
    (0, swagger_1.ApiQuery)({ name: "pageSize", description: "Resultados por pagina (modo offset)", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Catalogo de inventario paginado" }),
    __param(0, (0, common_1.Query)("category")),
    __param(1, (0, common_1.Query)("lowStock")),
    __param(2, (0, common_1.Query)("limit")),
    __param(3, (0, common_1.Query)("cursor")),
    __param(4, (0, common_1.Query)("search")),
    __param(5, (0, common_1.Query)("page")),
    __param(6, (0, common_1.Query)("pageSize")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, swagger_1.ApiOperation)({ summary: "Obtener detalle de un item", description: "Retorna el item completo con sus datos. Cache Redis (TTL 300s)." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del item (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Item encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Item no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Crear nuevo item de inventario", description: "Registra un nuevo repuesto/insumo con SKU unico, stock inicial y precio de venta. Invalida cache de catalogo." }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Item creado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "SKU ya existe" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inventory_dto_1.CreateItemDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar item de inventario", description: "Modifica datos del item. Si cambia SKU valida que no exista duplicado. Invalida cache individual y de catalogo." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del item (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Item actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Item no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "SKU duplicado" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, inventory_dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/movements"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({
        summary: "Registrar movimiento de inventario",
        description: "Ejecuta IN (ingreso), OUT (salida, requiere orderId) o ADJUSTMENT (ajuste, requiere justificacion). Transaccion atomica: movimiento + actualizacion de stock. Invalida toda la cache de inventario.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del item (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Movimiento registrado y stock actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos o stock insuficiente para OUT" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Item no encontrado" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, inventory_dto_1.InventoryMovementDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "addMovement", null);
__decorate([
    (0, common_1.Get)(":id/movements"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.OWNER, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, swagger_1.ApiOperation)({ summary: "Historial de movimientos de un item", description: "Listado paginado de todos los movimientos registrados para un item especifico." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del item (UUID v4)" }),
    (0, swagger_1.ApiQuery)({ name: "limit", required: false }),
    (0, swagger_1.ApiQuery)({ name: "cursor", required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Historial de movimientos" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("cursor")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Post)(":id/reserve"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({
        summary: "Reservar items para una orden de trabajo",
        description: "Reserva stock para una OT especifica. Transaccion atomica: decrementa stock + registra movimiento OUT + evento en la OT. Invalida cache de inventario.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID del item a reservar (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Stock reservado para la OT" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Stock insuficiente" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Item no encontrado" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "reserveForOrder", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)("Inventory"),
    (0, common_1.Controller)("inventory"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map