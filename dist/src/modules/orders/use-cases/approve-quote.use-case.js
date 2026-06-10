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
exports.ApproveQuoteUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const realtime_gateway_1 = require("../../../common/gateway/realtime.gateway");
const client_1 = require("@prisma/client");
let ApproveQuoteUseCase = class ApproveQuoteUseCase {
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
                quote: true,
                parts: { include: { item: { select: { id: true, stock: true, name: true } } } },
                vehicle: { select: { plate: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (order.status !== client_1.OrderStatus.BUDGETED) {
            throw new common_1.ConflictException(`Solo se puede aprobar cotizaciones en estado BUDGETED. Estado actual: ${order.status}`);
        }
        if (!order.quote) {
            throw new common_1.BadRequestException("La orden no tiene cotización emitida. Use POST /orders/:id/quote primero.");
        }
        if (order.quote.status !== client_1.QuoteStatus.SENT) {
            throw new common_1.ConflictException(`La cotización no está en estado SENT. Estado actual: ${order.quote.status}`);
        }
        const [updatedOrder] = await this.prisma.$transaction(async (tx) => {
            for (const part of order.parts) {
                if (part.item && part.item.stock < 0) {
                    throw new common_1.ConflictException(`Stock negativo detectado para repuesto: ${part.item.name}. Contacte al administrador.`);
                }
            }
            const updatedOrder = await tx.workOrder.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.IN_PROGRESS, startedAt: new Date() },
            });
            await tx.quote.update({
                where: { id: order.quote.id },
                data: {
                    status: client_1.QuoteStatus.APPROVED,
                    approvedAt: new Date(),
                    notes: `Firma digital: ${params.clientSignature}`,
                },
            });
            await tx.orderStatusHistory.create({
                data: { orderId, status: client_1.OrderStatus.IN_PROGRESS, changedBy: params.approverId },
            });
            await tx.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: "QUOTE_APPROVED",
                    description: `Cliente aprobó la cotización ${order.quote.number}. OT pasa a IN_PROGRESS.`,
                    metadata: {
                        quoteId: order.quote.id,
                        clientSignature: params.clientSignature,
                        approvedAt: new Date().toISOString(),
                    },
                    userId: params.approverId,
                },
            });
            return [updatedOrder];
        });
        this.wsGateway.emitOrderStatusChanged({
            orderId,
            oldStatus: client_1.OrderStatus.BUDGETED,
            newStatus: client_1.OrderStatus.IN_PROGRESS,
            updatedBy: params.approverId,
        });
        this.wsGateway.broadcastOrderUpdate({
            orderId,
            orderNumber: order.number,
            newStatus: client_1.OrderStatus.IN_PROGRESS,
            vehiclePlate: order.vehicle?.plate ?? "",
            changedById: params.approverId,
            timestamp: new Date().toISOString(),
        });
        return {
            success: true,
            orderId,
            orderNumber: order.number,
            newStatus: updatedOrder.status,
            quoteId: order.quote.id,
            approvedAt: new Date().toISOString(),
        };
    }
    async reject(orderId, params) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            include: { quote: true },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (!order.quote || order.quote.status !== client_1.QuoteStatus.SENT) {
            throw new common_1.BadRequestException("No hay cotización SENT activa para rechazar");
        }
        await this.prisma.$transaction([
            this.prisma.quote.update({
                where: { id: order.quote.id },
                data: { status: client_1.QuoteStatus.REJECTED, rejectedAt: new Date(), rejectionReason: params.reason },
            }),
            this.prisma.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: "QUOTE_REJECTED",
                    description: `Cliente rechazó la cotización ${order.quote.number}. Motivo: ${params.reason}`,
                    metadata: { quoteId: order.quote.id, reason: params.reason },
                    userId: params.rejectedBy,
                },
            }),
        ]);
        return { success: true, orderId, quoteId: order.quote.id, status: client_1.QuoteStatus.REJECTED };
    }
};
exports.ApproveQuoteUseCase = ApproveQuoteUseCase;
exports.ApproveQuoteUseCase = ApproveQuoteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], ApproveQuoteUseCase);
//# sourceMappingURL=approve-quote.use-case.js.map