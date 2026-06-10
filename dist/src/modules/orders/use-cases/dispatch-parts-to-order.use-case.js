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
exports.DispatchPartsToOrderUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const redis_service_1 = require("../../../common/redis/redis.service");
const queue_names_enum_1 = require("../../../queues/queue-names.enum");
const CACHE_PREFIX = "inventory";
let DispatchPartsToOrderUseCase = class DispatchPartsToOrderUseCase {
    prisma;
    redis;
    alertQueue;
    constructor(prisma, redis, alertQueue) {
        this.prisma = prisma;
        this.redis = redis;
        this.alertQueue = alertQueue;
    }
    async execute(orderId, params) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            select: { id: true, number: true, status: true },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (order.status !== "IN_PROGRESS") {
            throw new common_1.HttpException({
                statusCode: 422,
                error: "INVENTORY_NO_ACTIVE_ORDER",
                message: `Solo se puede despachar repuestos a OT en estado IN_PROGRESS. OT ${order.number} está en estado ${order.status}.`,
            }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const lowStockItems = [];
        const parts = await this.prisma.$transaction(async (tx) => {
            const created = [];
            for (const req of params.items) {
                const item = await tx.inventoryItem.findUnique({ where: { id: req.itemId } });
                if (!item)
                    throw new common_1.NotFoundException(`Repuesto ${req.itemId} no encontrado en inventario`);
                if (item.stock < req.quantity) {
                    throw new common_1.ConflictException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}, solicitado: ${req.quantity}`);
                }
                const newStock = item.stock - req.quantity;
                const part = await tx.workOrderPart.create({
                    data: { orderId, itemId: req.itemId, quantity: req.quantity, unitPrice: item.unitPrice },
                });
                await tx.inventoryMovement.create({
                    data: {
                        itemId: req.itemId,
                        type: "OUT",
                        quantity: req.quantity,
                        orderId,
                        authorizedBy: params.requestedBy,
                        unitCost: item.costPrice,
                        justification: `Despacho para OT ${order.number}`,
                    },
                });
                await tx.inventoryItem.update({
                    where: { id: req.itemId },
                    data: { stock: newStock },
                });
                await tx.workOrderEvent.create({
                    data: {
                        workOrderId: orderId,
                        event: "PART_REQUESTED",
                        description: `${params.requestedByName} despachó: ${item.name} x${req.quantity} → OT ${order.number}`,
                        metadata: { itemId: item.id, sku: item.sku, quantity: req.quantity, newStock },
                        userId: params.requestedBy,
                    },
                });
                if (newStock < item.minStock) {
                    lowStockItems.push({
                        itemId: item.id,
                        itemName: item.name,
                        sku: item.sku,
                        currentStock: newStock,
                        minStock: item.minStock,
                    });
                }
                created.push(part);
            }
            return created;
        });
        await Promise.allSettled(params.items.map((req) => this.redis.del(`${CACHE_PREFIX}:item:${req.itemId}`)));
        await Promise.allSettled([
            this.redis.del(`${CACHE_PREFIX}:valuation`),
            this.redis.del(`${CACHE_PREFIX}:critical`),
        ]);
        await Promise.allSettled(lowStockItems.map((alert) => this.alertQueue.add("low-stock-alert", {
            ...alert,
            workOrderId: orderId,
            workOrderNumber: order.number,
            triggeredAt: new Date().toISOString(),
        })));
        return { success: true, parts, lowStockAlerts: lowStockItems.length };
    }
};
exports.DispatchPartsToOrderUseCase = DispatchPartsToOrderUseCase;
exports.DispatchPartsToOrderUseCase = DispatchPartsToOrderUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(queue_names_enum_1.QueueName.ALERT_DISPATCHER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        bullmq_2.Queue])
], DispatchPartsToOrderUseCase);
//# sourceMappingURL=dispatch-parts-to-order.use-case.js.map