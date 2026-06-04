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
exports.PublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicController = class PublicController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async lookup(plate, code) {
        if (plate) {
            const vehicle = await this.prisma.vehicle.findUnique({ where: { plate: plate.toUpperCase().trim() }, include: { workOrders: { orderBy: { createdAt: "desc" }, take: 1, include: { statusHistory: { orderBy: { timestamp: "desc" } } } } } });
            if (!vehicle)
                return { found: false, message: "Vehiculo no encontrado" };
            const order = vehicle.workOrders[0];
            if (!order)
                return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, activeOrder: null };
            return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } };
        }
        if (code) {
            const order = await this.prisma.workOrder.findUnique({ where: { number: code.toUpperCase().trim() }, include: { vehicle: true, statusHistory: { orderBy: { timestamp: "desc" } } } });
            if (!order)
                return { found: false, message: "Orden de trabajo no encontrada" };
            return { found: true, vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } };
        }
        return { found: false, message: "Proporciona una placa (plate) o codigo de OT (code)" };
    }
    async getOrder(id) {
        const order = await this.prisma.workOrder.findUnique({ where: { id }, include: { vehicle: true, statusHistory: { orderBy: { timestamp: "desc" } } } });
        if (!order)
            return { found: false, message: "Orden de trabajo no encontrada" };
        return { found: true, vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color }, order: { id: order.id, number: order.number, status: order.status, description: order.description, diagnosis: order.diagnosis, totalCost: order.totalCost, receivedAt: order.receivedAt, estimatedDelivery: order.estimatedDelivery, deliveredAt: order.deliveredAt, statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })) } };
    }
    async getOrderByNumber(orderNumber) {
        const order = await this.prisma.workOrder.findUnique({ where: { number: orderNumber.toUpperCase().trim() }, select: { number: true, status: true, description: true, receivedAt: true, estimatedDelivery: true, deliveredAt: true, vehicle: { select: { plate: true, brand: true, model: true, year: true, color: true } }, client: { select: { firstName: true } }, statusHistory: { select: { status: true, timestamp: true }, orderBy: { timestamp: "asc" } } } });
        if (!order)
            return { found: false, message: "Orden de trabajo no encontrada" };
        return { found: true, order };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)("orders/lookup"),
    (0, swagger_1.ApiOperation)({
        summary: "Consultar estado de orden por placa o codigo (publico)",
        description: "Endpoint de acceso publico sin JWT para que clientes consulten el estado de su vehiculo por placa o codigo OT desde el portal web. Retorna datos del vehiculo y la OT mas reciente con historial de estados.",
    }),
    (0, swagger_1.ApiQuery)({ name: "plate", description: "Placa del vehiculo", required: false, example: "ABC-123" }),
    (0, swagger_1.ApiQuery)({ name: "code", description: "Codigo de OT", required: false, example: "OT-2026-0001" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Resultado de busqueda con datos del vehiculo y OT" }),
    __param(0, (0, common_1.Query)("plate")),
    __param(1, (0, common_1.Query)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "lookup", null);
__decorate([
    (0, common_1.Get)("orders/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Detalle de orden (publico)", description: "Endpoint publico para ver el detalle completo de una OT por su ID, incluyendo diagnostico y costos." }),
    (0, swagger_1.ApiParam)({ name: "id", description: "ID de la OT (UUID v4)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Detalle de la OT" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)("orders/number/:orderNumber/status"),
    (0, swagger_1.ApiOperation)({ summary: "Estado de OT por numero (publico)", description: "Endpoint publico que retorna el estado actual y timeline de una OT por su numero. Incluye datos del vehiculo y cliente." }),
    (0, swagger_1.ApiParam)({ name: "orderNumber", description: "Numero de OT", example: "OT-2026-0001" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Estado actual y timeline de la OT" }),
    __param(0, (0, common_1.Param)("orderNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOrderByNumber", null);
exports.PublicController = PublicController = __decorate([
    (0, swagger_1.ApiTags)("Public"),
    (0, common_1.Controller)("public"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicController);
//# sourceMappingURL=public.controller.js.map