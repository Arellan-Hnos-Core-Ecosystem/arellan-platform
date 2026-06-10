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
exports.SendOrderQuoteUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const realtime_gateway_1 = require("../../../common/gateway/realtime.gateway");
const finance_service_1 = require("../../finance/finance.service");
const work_order_entity_1 = require("../../../domain/work-orders/entities/work-order.entity");
const client_1 = require("@prisma/client");
const queue_names_enum_1 = require("../../../queues/queue-names.enum");
const money_vo_1 = require("../../../domain/work-orders/value-objects/money.vo");
const IMPORT_COMMISSION_RATE = 0.18;
let SendOrderQuoteUseCase = class SendOrderQuoteUseCase {
    prisma;
    financeService;
    wsGateway;
    notificationsQueue;
    constructor(prisma, financeService, wsGateway, notificationsQueue) {
        this.prisma = prisma;
        this.financeService = financeService;
        this.wsGateway = wsGateway;
        this.notificationsQueue = notificationsQueue;
    }
    async execute(orderId, params) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            include: {
                parts: { include: { item: { select: { id: true, isImported: true, customsCost: true } } } },
                vehicle: { select: { plate: true } },
            },
        });
        if (!order)
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        if (order.status !== client_1.OrderStatus.BUDGETED) {
            throw new common_1.ConflictException(`La OT debe estar en estado BUDGETED para enviar cotización. Estado actual: ${order.status}`);
        }
        const domainWO = work_order_entity_1.WorkOrder.reconstitute({
            id: order.id,
            orderNumber: 0,
            clientId: order.clientId,
            vehicleId: order.vehicleId,
            mechanicId: order.mechanicId,
            status: { value: order.status, canTransitionTo: () => true, allowedTransitions: () => [], isTerminal: () => false, equals: (o) => o.value === order.status },
            laborCost: money_vo_1.Money.of(params.laborCost),
            partsCost: money_vo_1.Money.of(params.partsCost),
            discount: money_vo_1.Money.fromDecimal(order.discount),
            description: order.description,
            observations: null,
            completedAt: null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        });
        domainWO.assertCanSendQuote();
        const storedTotal = Number(order.totalCost ?? 0);
        const updatedTotal = params.laborCost + params.partsCost - Number(order.discount);
        if (storedTotal > 0 && Math.abs(storedTotal - updatedTotal) > 0.01) {
            domainWO.assertCanSendQuote_totalConsistency(storedTotal);
        }
        const importedParts = order.parts.filter((p) => p.item?.isImported);
        const customsCost = importedParts.reduce((sum, p) => {
            const unitCustoms = Number(p.item?.customsCost ?? 0);
            return sum + unitCustoms * p.quantity * (1 + IMPORT_COMMISSION_RATE);
        }, 0);
        const roundedCustomsCost = Math.round(customsCost * 100) / 100;
        if (importedParts.length > 0 && roundedCustomsCost <= 0) {
            throw new common_1.BadRequestException(`Regla Anti-Fraude: la OT tiene ${importedParts.length} repuesto(s) importado(s) pero customsCost es cero. Verifique los costos de importación.`);
        }
        const finalPartsCost = params.partsCost + roundedCustomsCost;
        const finalTotal = params.laborCost + finalPartsCost - Number(order.discount);
        const { quote } = await this.prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.workOrder.update({
                where: { id: orderId },
                data: {
                    laborCost: params.laborCost,
                    partsCost: finalPartsCost,
                    totalCost: finalTotal,
                    finalAmount: finalTotal,
                },
            });
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + (params.validDays ?? 3));
            const year = new Date().getFullYear();
            const count = await tx.quote.count({ where: { number: { startsWith: `QUO-${year}-` } } });
            const quoteNumber = `QUO-${year}-${String(count + 1).padStart(4, "0")}`;
            const quote = await tx.quote.upsert({
                where: { workOrderId: orderId },
                update: {
                    status: client_1.QuoteStatus.SENT,
                    subtotal: params.laborCost + finalPartsCost,
                    tax: Math.round(finalTotal * 0.18 * 100) / 100,
                    total: finalTotal,
                    validUntil,
                    approvedAt: null,
                    rejectedAt: null,
                    rejectionReason: null,
                },
                create: {
                    number: quoteNumber,
                    clientId: order.clientId,
                    workOrderId: orderId,
                    status: client_1.QuoteStatus.SENT,
                    subtotal: params.laborCost + finalPartsCost,
                    tax: Math.round(finalTotal * 0.18 * 100) / 100,
                    total: finalTotal,
                    validUntil,
                    createdBy: params.requestedBy,
                },
            });
            await tx.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: "QUOTE_SENT",
                    description: `Cotización ${quote.number} enviada al cliente. Total: S/ ${finalTotal.toFixed(2)}${importedParts.length > 0 ? ` (incluye S/ ${roundedCustomsCost.toFixed(2)} en costos de importación)` : ""}`,
                    metadata: {
                        quoteId: quote.id,
                        quoteNumber: quote.number,
                        laborCost: params.laborCost,
                        partsCost: finalPartsCost,
                        customsCost: roundedCustomsCost,
                        total: finalTotal,
                        importedPartsCount: importedParts.length,
                    },
                    userId: params.requestedBy,
                },
            });
            void updatedOrder;
            return { quote };
        });
        const invoiceDraft = await this.financeService.createInvoiceDraft({
            workOrderId: orderId,
            clientId: order.clientId,
            laborCost: params.laborCost,
            partsCost: finalPartsCost,
            customsCost: roundedCustomsCost,
            createdBy: params.requestedBy,
        });
        await this.notificationsQueue.add("quote-sent", {
            workOrderId: orderId,
            clientId: order.clientId,
            quoteId: quote.id,
            quoteNumber: quote.number,
            total: finalTotal,
            validUntil: quote.validUntil.toISOString(),
            vehiclePlate: order.vehicle?.plate ?? "",
        });
        this.wsGateway.broadcastOrderUpdate({
            orderId,
            orderNumber: order.number,
            newStatus: order.status,
            vehiclePlate: order.vehicle?.plate ?? "",
            changedById: params.requestedBy,
            timestamp: new Date().toISOString(),
        });
        return { success: true, quoteId: quote.id, quoteNumber: quote.number, total: finalTotal, customsCost: roundedCustomsCost, invoiceId: invoiceDraft.id };
    }
};
exports.SendOrderQuoteUseCase = SendOrderQuoteUseCase;
exports.SendOrderQuoteUseCase = SendOrderQuoteUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)(queue_names_enum_1.QueueName.NOTIFICATIONS)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        finance_service_1.FinanceService,
        realtime_gateway_1.RealtimeGateway,
        bullmq_2.Queue])
], SendOrderQuoteUseCase);
//# sourceMappingURL=send-order-quote.use-case.js.map