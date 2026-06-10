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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverVehicleUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const realtime_gateway_1 = require("../../../common/gateway/realtime.gateway");
const client_1 = require("@prisma/client");
let DeliverVehicleUseCase = class DeliverVehicleUseCase {
    prisma;
    wsGateway;
    constructor(prisma, wsGateway) {
        this.prisma = prisma;
        this.wsGateway = wsGateway;
    }
    async execute(orderId, params) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            include: {
                client: { select: { id: true, firstName: true, lastName: true } },
                vehicle: { select: { plate: true, brand: true, model: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (order.status !== client_1.OrderStatus.READY) {
            throw new common_1.ConflictException(`Solo se puede entregar OT en estado READY. Estado actual: ${order.status}`);
        }
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const session = await this.prisma.cashboxSession.findFirst({
            where: { status: "OPEN", openedAt: { gte: todayStart, lte: todayEnd } },
        });
        if (!session) {
            throw new common_1.BadRequestException({
                statusCode: 400,
                error: "NO_OPEN_CASHBOX",
                message: "No hay sesión de caja abierta hoy. Abra la caja antes de registrar entregas.",
            });
        }
        const amount = Number(order.finalAmount ?? order.totalCost ?? 0);
        const [updatedOrder] = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.workOrder.update({
                where: { id: orderId },
                data: {
                    status: client_1.OrderStatus.DELIVERED,
                    deliveredAt: new Date(),
                    paymentStatus: "PAID",
                },
            });
            await tx.orderStatusHistory.create({
                data: { orderId, status: client_1.OrderStatus.DELIVERED, changedBy: params.deliveredBy },
            });
            await tx.financialTransaction.create({
                data: {
                    sessionId: session.id,
                    type: client_1.TransactionType.PAYMENT,
                    amount,
                    paymentMethod: params.paymentMethod,
                    orderId,
                    referenceToken: params.clientSignature,
                    description: `Pago OT ${order.number} — ${order.vehicle?.plate ?? ""}`,
                },
            });
            await tx.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: "VEHICLE_DELIVERED",
                    description: `${params.deliveredByName} registró entrega del vehículo. Firma: ${params.clientSignature}`,
                    metadata: {
                        clientSignature: params.clientSignature,
                        amount,
                        paymentMethod: params.paymentMethod,
                        sessionId: session.id,
                    },
                    userId: params.deliveredBy,
                },
            });
            return [updated];
        });
        this.wsGateway.emitOrderStatusChanged({
            orderId,
            oldStatus: client_1.OrderStatus.READY,
            newStatus: client_1.OrderStatus.DELIVERED,
            updatedBy: params.deliveredBy,
        });
        this.wsGateway.emitVehicleDelivered({
            orderId,
            orderNumber: order.number,
            clientId: order.clientId,
            vehiclePlate: order.vehicle?.plate ?? "",
            deliveredAt: new Date().toISOString(),
        });
        return {
            success: true,
            orderId,
            orderNumber: order.number,
            newStatus: updatedOrder.status,
            deliveredAt: new Date().toISOString(),
            transactionSessionId: session.id,
        };
    }
};
exports.DeliverVehicleUseCase = DeliverVehicleUseCase;
exports.DeliverVehicleUseCase = DeliverVehicleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], DeliverVehicleUseCase);
//# sourceMappingURL=deliver-vehicle.use-case.js.map