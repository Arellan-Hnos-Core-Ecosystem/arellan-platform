import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { FinanceService } from "../../finance/finance.service"
import { WorkOrder } from "../../../domain/work-orders/entities/work-order.entity"
import { OrderStatus, QuoteStatus } from "@prisma/client"
import { QueueName } from "../../../queues/queue-names.enum"
import { Money } from "../../../domain/work-orders/value-objects/money.vo"

const IMPORT_COMMISSION_RATE = 0.18

@Injectable()
export class SendOrderQuoteUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financeService: FinanceService,
    private readonly wsGateway: RealtimeGateway,
    @InjectQueue(QueueName.NOTIFICATIONS) private readonly notificationsQueue: Queue,
  ) {}

  async execute(orderId: string, params: {
    laborCost: number
    partsCost: number
    validDays?: number
    requestedBy: string
  }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        parts: { include: { item: { select: { id: true, isImported: true, customsCost: true } } } },
        vehicle: { select: { plate: true } },
      },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (order.status !== OrderStatus.BUDGETED) {
      throw new ConflictException(`La OT debe estar en estado BUDGETED para enviar cotización. Estado actual: ${order.status}`)
    }

    // Domain invariant: costs must be > 0
    const domainWO = WorkOrder.reconstitute({
      id: order.id,
      orderNumber: 0,
      clientId: order.clientId,
      vehicleId: order.vehicleId,
      mechanicId: order.mechanicId,
      status: { value: order.status, canTransitionTo: () => true, allowedTransitions: () => [], isTerminal: () => false, equals: (o: any) => o.value === order.status } as any,
      laborCost: Money.of(params.laborCost),
      partsCost: Money.of(params.partsCost),
      discount: Money.fromDecimal(order.discount),
      description: order.description,
      observations: null,
      completedAt: null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
    domainWO.assertCanSendQuote()

    // Anti-Fraud: totalCost consistency check
    const storedTotal = Number(order.totalCost ?? 0)
    const updatedTotal = params.laborCost + params.partsCost - Number(order.discount)
    if (storedTotal > 0 && Math.abs(storedTotal - updatedTotal) > 0.01) {
      domainWO.assertCanSendQuote_totalConsistency(storedTotal)
    }

    // Anti-Fraud: imported parts → mandatory customs commission
    const importedParts = order.parts.filter((p) => p.item?.isImported)
    const customsCost = importedParts.reduce((sum, p) => {
      const unitCustoms = Number(p.item?.customsCost ?? 0)
      return sum + unitCustoms * p.quantity * (1 + IMPORT_COMMISSION_RATE)
    }, 0)
    const roundedCustomsCost = Math.round(customsCost * 100) / 100

    if (importedParts.length > 0 && roundedCustomsCost <= 0) {
      throw new BadRequestException(
        `Regla Anti-Fraude: la OT tiene ${importedParts.length} repuesto(s) importado(s) pero customsCost es cero. Verifique los costos de importación.`,
      )
    }

    const finalPartsCost = params.partsCost + roundedCustomsCost
    const finalTotal = params.laborCost + finalPartsCost - Number(order.discount)

    // Atomic transaction: update WO costs + create/update invoice draft + create/update quote
    const { quote } = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.workOrder.update({
        where: { id: orderId },
        data: {
          laborCost: params.laborCost,
          partsCost: finalPartsCost,
          totalCost: finalTotal,
          finalAmount: finalTotal,
        },
      })

      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + (params.validDays ?? 3))

      const year = new Date().getFullYear()
      const count = await tx.quote.count({ where: { number: { startsWith: `QUO-${year}-` } } })
      const quoteNumber = `QUO-${year}-${String(count + 1).padStart(4, "0")}`

      const quote = await tx.quote.upsert({
        where: { workOrderId: orderId },
        update: {
          status: QuoteStatus.SENT,
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
          status: QuoteStatus.SENT,
          subtotal: params.laborCost + finalPartsCost,
          tax: Math.round(finalTotal * 0.18 * 100) / 100,
          total: finalTotal,
          validUntil,
          createdBy: params.requestedBy,
        },
      })

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
      })

      void updatedOrder
      return { quote }
    })

    // Invoice draft (outside transaction — uses upsert, idempotent)
    const invoiceDraft = await this.financeService.createInvoiceDraft({
      workOrderId: orderId,
      clientId: order.clientId,
      laborCost: params.laborCost,
      partsCost: finalPartsCost,
      customsCost: roundedCustomsCost,
      createdBy: params.requestedBy,
    })

    // BullMQ: async customer notification
    await this.notificationsQueue.add("quote-sent", {
      workOrderId: orderId,
      clientId: order.clientId,
      quoteId: quote.id,
      quoteNumber: quote.number,
      total: finalTotal,
      validUntil: quote.validUntil.toISOString(),
      vehiclePlate: order.vehicle?.plate ?? "",
    })

    // WebSocket: real-time update to dashboard
    this.wsGateway.broadcastOrderUpdate({
      orderId,
      orderNumber: order.number,
      newStatus: order.status,
      vehiclePlate: order.vehicle?.plate ?? "",
      changedById: params.requestedBy,
      timestamp: new Date().toISOString(),
    })

    return { success: true, quoteId: quote.id, quoteNumber: quote.number, total: finalTotal, customsCost: roundedCustomsCost, invoiceId: invoiceDraft.id }
  }
}
