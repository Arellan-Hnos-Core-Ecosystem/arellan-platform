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
const prisma_service_1 = require("../prisma/prisma.service");
let PublicController = class PublicController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async lookup(plate, code) {
        if (plate) {
            const vehicle = await this.prisma.vehicle.findUnique({
                where: { plate: plate.toUpperCase().trim() },
                include: {
                    workOrders: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        include: { statusHistory: { orderBy: { timestamp: "desc" } } },
                    },
                },
            });
            if (!vehicle) {
                return { found: false, message: "Vehiculo no encontrado" };
            }
            const order = vehicle.workOrders[0];
            if (!order)
                return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, activeOrder: null };
            return {
                found: true,
                vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color },
                order: {
                    id: order.id,
                    number: order.number,
                    status: order.status,
                    description: order.description,
                    receivedAt: order.receivedAt,
                    estimatedDelivery: order.estimatedDelivery,
                    deliveredAt: order.deliveredAt,
                    statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
                },
            };
        }
        if (code) {
            const order = await this.prisma.workOrder.findUnique({
                where: { number: code.toUpperCase().trim() },
                include: {
                    vehicle: true,
                    statusHistory: { orderBy: { timestamp: "desc" } },
                },
            });
            if (!order) {
                return { found: false, message: "Orden de trabajo no encontrada" };
            }
            return {
                found: true,
                vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color },
                order: {
                    id: order.id,
                    number: order.number,
                    status: order.status,
                    description: order.description,
                    receivedAt: order.receivedAt,
                    estimatedDelivery: order.estimatedDelivery,
                    deliveredAt: order.deliveredAt,
                    statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
                },
            };
        }
        return { found: false, message: "Proporciona una placa (plate) o codigo de OT (code)" };
    }
    async getOrder(id) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id },
            include: {
                vehicle: true,
                statusHistory: { orderBy: { timestamp: "desc" } },
            },
        });
        if (!order) {
            return { found: false, message: "Orden de trabajo no encontrada" };
        }
        return {
            found: true,
            vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color },
            order: {
                id: order.id,
                number: order.number,
                status: order.status,
                description: order.description,
                diagnosis: order.diagnosis,
                totalCost: order.totalCost,
                receivedAt: order.receivedAt,
                estimatedDelivery: order.estimatedDelivery,
                deliveredAt: order.deliveredAt,
                statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
            },
        };
    }
    async getOrderByNumber(orderNumber) {
        const order = await this.prisma.workOrder.findUnique({
            where: { number: orderNumber.toUpperCase().trim() },
            select: {
                number: true,
                status: true,
                description: true,
                receivedAt: true,
                estimatedDelivery: true,
                deliveredAt: true,
                vehicle: {
                    select: { plate: true, brand: true, model: true, year: true, color: true },
                },
                client: {
                    select: { firstName: true },
                },
                statusHistory: {
                    select: { status: true, timestamp: true },
                    orderBy: { timestamp: "asc" },
                },
            },
        });
        if (!order) {
            return { found: false, message: "Orden de trabajo no encontrada" };
        }
        return { found: true, order };
    }
};
exports.PublicController = PublicController;
__decorate([
    (0, common_1.Get)("orders/lookup"),
    __param(0, (0, common_1.Query)("plate")),
    __param(1, (0, common_1.Query)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "lookup", null);
__decorate([
    (0, common_1.Get)("orders/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)("orders/number/:orderNumber/status"),
    __param(0, (0, common_1.Param)("orderNumber")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicController.prototype, "getOrderByNumber", null);
exports.PublicController = PublicController = __decorate([
    (0, common_1.Controller)("public"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicController);
//# sourceMappingURL=public.controller.js.map