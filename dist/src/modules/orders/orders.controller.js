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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("./orders.service");
const orders_dto_1 = require("./dto/orders.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const data_masking_interceptor_1 = require("../../common/interceptors/data-masking.interceptor");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    findAll(filters) {
        return this.ordersService.findAll(filters);
    }
    findMyOrders(user, filters) {
        return this.ordersService.findByMechanic(user.id, filters);
    }
    getSummaryStats() {
        return this.ordersService.getSummaryStats();
    }
    findByStatus(status) {
        return this.ordersService.findAll({ status: status });
    }
    findOne(id) {
        return this.ordersService.findOne(id);
    }
    create(dto, user) {
        return this.ordersService.create(dto, user.id);
    }
    update(id, dto) {
        return this.ordersService.update(id, dto);
    }
    updateStatus(id, dto, user) {
        return this.ordersService.updateStatus(id, dto, user.id);
    }
    remove(id) {
        return this.ordersService.softDelete(id);
    }
    applyDiscount(orderId, dto, user) {
        return this.ordersService.applyDiscount(orderId, dto, user.id, user.role);
    }
    async uploadPhoto(id, photo, description) {
        return this.ordersService.uploadPhoto(id, photo, description);
    }
    async requestParts(id, dto, user) {
        return this.ordersService.requestParts(id, dto, user.id, user.name);
    }
    async reportProgress(id, dto, user) {
        return this.ordersService.reportProgress(id, dto, user.id, user.name);
    }
    async deletePhoto(id, photoId, user) {
        return this.ordersService.deletePhoto(id, photoId, user.id, user.name);
    }
    async vehicleCheckin(body, photos, user) {
        return this.ordersService.vehicleCheckin(body, photos ?? [], user?.id ?? "system", user?.name ?? "Sistema");
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: "Listar ordenes de trabajo",
        description: "Listado paginado de todas las OT con filtros por estado, mecanico, rango de fechas, cursor. Incluye datos de vehiculo, cliente y mecanico asignado.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado paginado de ordenes" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido o expirado" }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.OrderFilterDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("my"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Listar mis ordenes asignadas (mecanico)",
        description: "Retorna las OT asignadas al mecanico autenticado (via JWT). Incluye repuestos consumidos y fotos. Usado por la tablet del taller (arellan-mechanic-ui).",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Listado de OT del mecanico" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo rol MECHANIC" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, orders_dto_1.OrderFilterDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findMyOrders", null);
__decorate([
    (0, common_1.Get)("stats/summary"),
    (0, swagger_1.ApiOperation)({
        summary: "Estadisticas resumidas del taller",
        description: "KPIs: ordenes activas, recibidas hoy, completadas hoy, entregadas hoy, total historico, pendientes de pago, ingresos del dia, items con stock critico.",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resumen de estadisticas" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getSummaryStats", null);
__decorate([
    (0, common_1.Get)("by-status/:status"),
    (0, swagger_1.ApiOperation)({
        summary: "Filtrar ordenes por estado",
        description: "Atajo para listar ordenes filtradas exclusivamente por su estado actual en el flujo de trabajo.",
    }),
    (0, swagger_1.ApiParam)({ name: "status", description: "Estado de orden: RECEIVED, IN_DIAGNOSIS, BUDGETED, IN_PROGRESS, IN_REVIEW, READY, DELIVERED, CANCELLED", example: "IN_PROGRESS" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Ordenes filtradas por estado" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Param)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Obtener detalle de una orden", description: "Retorna la OT completa con partes, fotos, historial de estados, pagos asociados y datos del vehiculo/cliente/mecanico." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la orden de trabajo (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Detalle completo de la OT" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Orden no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Crear nueva orden de trabajo",
        description: "Registra una OT con numero autoincremental (OT-AAAA-NNNN). Asigna vehiculo, cliente y mecanico. Emite evento WebSocket order:created al dashboard gerencial.",
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "OT creada exitosamente" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER o ADMIN" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: "Actualizar datos de una orden", description: "Modifica diagnostico, costos de mano de obra/repuestos, y fecha estimada de entrega. Recalcula totalCost automaticamente." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "OT actualizada" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER o ADMIN" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "No se puede modificar una OT cancelada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(":id/status"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Transicionar estado de la orden",
        description: "Cambia el estado segun la maquina de estados valida. Al transicionar a DELIVERED valida que laborCost + partsCost == totalPaid (regla antifraude). Emite WebSocket order:status_changed. Alerta si pago Yape >= S/500.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Estado actualizado + evento WebSocket emitido" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Transicion invalida segun flujo de trabajo" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo MECHANIC o ADMIN; DELIVERED bloqueado si pago insuficiente" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.UpdateStatusDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: "Cancelar orden (soft delete)", description: "Marca la OT como CANCELLED. Solo OWNER. No elimina fisicamente el registro." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "OT cancelada" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    (0, swagger_1.ApiResponse)({ status: 403, description: "Solo OWNER" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    (0, swagger_1.ApiResponse)({ status: 422, description: "OT ya estaba cancelada" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/discount"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.OWNER, client_1.UserRole.ADMIN, client_1.UserRole.MECHANIC),
    (0, swagger_1.ApiOperation)({
        summary: "Aplicar descuento a una orden",
        description: "Aplica descuento por monto fijo o porcentaje. Si el descuento supera el 20% del total, se requiere aprobacion de OWNER via flujo de aprobaciones.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Descuento aplicado" }),
    (0, swagger_1.ApiResponse)({ status: 202, description: "Descuento pendiente de aprobacion OWNER (>20%)" }),
    (0, swagger_1.ApiResponse)({ status: 401, description: "JWT invalido" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.ApplyDiscountDto, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "applyDiscount", null);
__decorate([
    (0, common_1.Post)(":id/photos"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("photo")),
    (0, swagger_1.ApiOperation)({
        summary: "Subir foto a una orden de trabajo",
        description: "Adjunta una imagen (JPEG/PNG) a la OT. Usado por mecanicos desde la tablet para documentar el estado del vehiculo. Invalida cache de ordenes.",
    }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({ schema: { type: "object", properties: { photo: { type: "string", format: "binary", description: "Archivo de imagen" }, description: { type: "string", example: "Filtro de aceite danado" } } } }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Foto subida y vinculada a la OT" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)("description")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Post)(":id/parts"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Solicitar repuestos para una orden",
        description: "Agrega repuestos del inventario a la OT con descuento automatico de stock. Procesa una lista de items y registra eventos PART_REQUESTED en la bitacora.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Repuestos solicitados y stock actualizado" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Datos invalidos" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT o item no encontrado" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Stock insuficiente u OT finalizada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.RequestPartsDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "requestParts", null);
__decorate([
    (0, common_1.Post)(":id/progress"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Reportar avance tecnico de una orden",
        description: "Registra el porcentaje de avance, repuestos instalados y horas de trabajo. Crea un evento en la bitacora de la OT para trazabilidad completa.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Avance registrado en la bitacora" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, orders_dto_1.MechanicProgressDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "reportProgress", null);
__decorate([
    (0, common_1.Delete)(":id/photos/:photoId"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Eliminar foto de una orden de trabajo",
        description: "Elimina una foto asociada a la OT y registra un evento PHOTO_DELETED en la bitacora.",
    }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiParam)({ name: "photoId", description: "ID de la foto a eliminar (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Foto eliminada y evento registrado" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "OT o foto no encontrada" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("photoId")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "deletePhoto", null);
__decorate([
    (0, common_1.Post)("checkin"),
    (0, roles_decorator_1.Roles)(client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(data_masking_interceptor_1.DataMaskingInterceptor, (0, platform_express_1.FilesInterceptor)("photos", 10)),
    (0, swagger_1.ApiOperation)({
        summary: "Ingreso rapido de vehiculo al taller",
        description: "Crea o encuentra un vehiculo por placa y genera una OT nueva. Recibe fotos multipart del vehiculo. Usado desde la tablet por el mecanico al recibir un auto.",
    }),
    (0, swagger_1.ApiConsumes)("multipart/form-data"),
    (0, swagger_1.ApiBody)({ schema: { type: "object", properties: {
                plate: { type: "string", example: "ABC-123" },
                brand: { type: "string", example: "Toyota" },
                model: { type: "string", example: "Hiace" },
                kilometerReading: { type: "string", example: "85000" },
                fuelLevel: { type: "string", example: "HALF" },
                description: { type: "string", example: "Cambio de aceite y filtros" },
                photoPositions: { type: "string", example: "FRONT,BACK,LEFT,RIGHT" },
                photos: { type: "array", items: { type: "string", format: "binary" } },
            } } }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Vehiculo ingresado y OT creada" }),
    (0, swagger_1.ApiResponse)({ status: 409, description: "Ya existe una OT activa para esa placa" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [orders_dto_1.VehicleCheckinDto, Array, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "vehicleCheckin", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)("Orders"),
    (0, common_1.Controller)("orders"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)("access-token"),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map