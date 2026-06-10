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
exports.CompleteWorkOrderUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const realtime_gateway_1 = require("../../../common/gateway/realtime.gateway");
const queue_names_enum_1 = require("../../../queues/queue-names.enum");
const client_1 = require("@prisma/client");
const work_order_entity_1 = require("../../../domain/work-orders/entities/work-order.entity");
const order_status_vo_1 = require("../../../domain/work-orders/value-objects/order-status.vo");
let CompleteWorkOrderUseCase = class CompleteWorkOrderUseCase {
    prisma;
    wsGateway;
    auditQueue;
    constructor(prisma, wsGateway, auditQueue) {
        this.prisma = prisma;
        this.wsGateway = wsGateway;
        this.auditQueue = auditQueue;
    }
    async execute(orderId, params) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            select: {
                id: true, number: true, status: true, odometerIn: true,
                internalNotes: true, mechanicId: true, startedAt: true,
            },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (order.status !== client_1.OrderStatus.IN_PROGRESS) {
            throw new common_1.ConflictException(`Solo se puede finalizar trabajo de OT en estado IN_PROGRESS. Estado actual: ${order.status}`);
        }
        work_order_entity_1.WorkOrder.assertOdometerOut(order.odometerIn, params.odometerOut);
        const target = work_order_entity_1.WorkOrder.resolveCompletionTarget(order_status_vo_1.OrderStatus.from(order.status), order_status_vo_1.OrderStatus.from(params.requestedStatus), params.userRole);
        const effectiveStatus = target.value;
        const now = new Date();
        const noteEntry = `[${now.toISOString()}] ${params.userName}: ${params.technicalNotes}`;
        const internalNotes = order.internalNotes ? `${order.internalNotes}\n${noteEntry}` : noteEntry;
        const isReady = effectiveStatus === client_1.OrderStatus.READY;
        const eventName = isReady ? "WORK_COMPLETED" : "SENT_TO_REVIEW";
        const eventDescription = isReady
            ? `${params.userName} finalizó el trabajo y marcó la OT como lista para entrega. Odómetro de salida: ${params.odometerOut} km.`
            : `${params.userName} envió la OT a revisión de calidad del Jefe de Taller. Odómetro de salida: ${params.odometerOut} km.`;
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: { id: orderId },
                data: {
                    status: effectiveStatus,
                    odometerOut: params.odometerOut,
                    internalNotes,
                    completedAt: now,
                },
            }),
            this.prisma.orderStatusHistory.create({
                data: { orderId, status: effectiveStatus, changedBy: params.userId },
            }),
            this.prisma.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: eventName,
                    description: eventDescription,
                    metadata: {
                        odometerIn: order.odometerIn,
                        odometerOut: params.odometerOut,
                        technicalNotes: params.technicalNotes,
                        requestedStatus: params.requestedStatus,
                        effectiveStatus,
                        role: params.userRole,
                    },
                    userId: params.userId,
                },
            }),
        ]);
        const distanceKm = order.odometerIn != null ? params.odometerOut - order.odometerIn : null;
        const durationMinutes = order.startedAt
            ? Math.round((now.getTime() - order.startedAt.getTime()) / 60000)
            : null;
        await this.auditQueue.add("mechanic-efficiency", {
            userId: params.userId,
            userName: params.userName,
            role: params.userRole,
            action: "WORK_ORDER_COMPLETED",
            entity: "WorkOrder",
            entityId: orderId,
            beforeState: { status: client_1.OrderStatus.IN_PROGRESS, odometerOut: null },
            afterState: { status: effectiveStatus, odometerOut: params.odometerOut },
            integrityHash: (0, crypto_1.createHash)("sha256")
                .update(`${orderId}:${params.userId}:${effectiveStatus}:${now.toISOString()}`)
                .digest("hex"),
            ipAddress: "system",
            userAgent: null,
            correlationId: `complete-${orderId}-${now.getTime()}`,
            metadata: {
                orderNumber: order.number,
                mechanicId: order.mechanicId,
                odometerIn: order.odometerIn,
                odometerOut: params.odometerOut,
                distanceKm,
                durationMinutes,
                effectiveStatus,
                requestedStatus: params.requestedStatus,
            },
        });
        this.wsGateway.emitOrderStatusChanged({
            orderId,
            oldStatus: client_1.OrderStatus.IN_PROGRESS,
            newStatus: effectiveStatus,
            updatedBy: params.userId,
        });
        if (effectiveStatus === client_1.OrderStatus.IN_REVIEW) {
            this.wsGateway.emitQaInspectionRequested({
                orderId,
                orderNumber: order.number,
                mechanicName: params.userName,
                role: params.userRole,
                odometerOut: params.odometerOut,
                technicalNotes: params.technicalNotes,
            });
        }
        return {
            success: true,
            orderId,
            orderNumber: order.number,
            previousStatus: client_1.OrderStatus.IN_PROGRESS,
            newStatus: updated.status,
            odometerOut: params.odometerOut,
            completedAt: now.toISOString(),
        };
    }
};
exports.CompleteWorkOrderUseCase = CompleteWorkOrderUseCase;
exports.CompleteWorkOrderUseCase = CompleteWorkOrderUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(queue_names_enum_1.QueueName.AUDIT_EVENTS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        bullmq_2.Queue])
], CompleteWorkOrderUseCase);
//# sourceMappingURL=complete-work-order.use-case.js.map