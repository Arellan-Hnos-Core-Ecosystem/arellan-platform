import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { OrderStatus, QuoteStatus } from "@prisma/client"

@Injectable()
export class ApproveQuoteUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: RealtimeGateway,
  ) {}

  async execute(orderId: string, params: {
    clientSignature: string
    approverId: string
  }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        quote: true,
        parts: { include: { item: { select: { id: true, stock: true, name: true } } } },
        vehicle: { select: { plate: true } },
      },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (order.status !== OrderStatus.BUDGETED) {
      throw new ConflictException(`Solo se puede aprobar cotizaciones en estado BUDGETED. Estado actual: ${order.status}`)
    }
    if (!order.quote) {
      throw new BadRequestException("La orden no tiene cotización emitida. Use POST /orders/:id/quote primero.")
    }
    if (order.quote.status !== QuoteStatus.SENT) {
      throw new ConflictException(`La cotización no está en estado SENT. Estado actual: ${order.quote.status}`)
    }

    // Atomic: mark quote approved + transition OT to IN_PROGRESS + reserve inventory
    const [updatedOrder] = await this.prisma.$transaction(async (tx) => {
      // Reserve inventory: verify stock for each part (already decremented at requestParts time)
      for (const part of order.parts) {
        if (part.item && part.item.stock < 0) {
          throw new ConflictException(`Stock negativo detectado para repuesto: ${part.item.name}. Contacte al administrador.`)
        }
      }

      const updatedOrder = await tx.workOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.IN_PROGRESS, startedAt: new Date() },
      })

      await tx.quote.update({
        where: { id: order.quote!.id },
        data: {
          status: QuoteStatus.APPROVED,
          approvedAt: new Date(),
          notes: `Firma digital: ${params.clientSignature}`,
        },
      })

      await tx.orderStatusHistory.create({
        data: { orderId, status: OrderStatus.IN_PROGRESS, changedBy: params.approverId },
      })

      await tx.workOrderEvent.create({
        data: {
          workOrderId: orderId,
          event: "QUOTE_APPROVED",
          description: `Cliente aprobó la cotización ${order.quote!.number}. OT pasa a IN_PROGRESS.`,
          metadata: {
            quoteId: order.quote!.id,
            clientSignature: params.clientSignature,
            approvedAt: new Date().toISOString(),
          },
          userId: params.approverId,
        },
      })

      return [updatedOrder]
    })

    // WebSocket: push real-time to mechanic tablets and dashboard
    this.wsGateway.emitOrderStatusChanged({
      orderId,
      oldStatus: OrderStatus.BUDGETED,
      newStatus: OrderStatus.IN_PROGRESS,
      updatedBy: params.approverId,
    })
    this.wsGateway.broadcastOrderUpdate({
      orderId,
      orderNumber: order.number,
      newStatus: OrderStatus.IN_PROGRESS,
      vehiclePlate: order.vehicle?.plate ?? "",
      changedById: params.approverId,
      timestamp: new Date().toISOString(),
    })

    return {
      success: true,
      orderId,
      orderNumber: order.number,
      newStatus: updatedOrder.status,
      quoteId: order.quote.id,
      approvedAt: new Date().toISOString(),
    }
  }

  async reject(orderId: string, params: { reason: string; rejectedBy: string }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: { quote: true },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (!order.quote || order.quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException("No hay cotización SENT activa para rechazar")
    }

    await this.prisma.$transaction([
      this.prisma.quote.update({
        where: { id: order.quote.id },
        data: { status: QuoteStatus.REJECTED, rejectedAt: new Date(), rejectionReason: params.reason },
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
    ])

    return { success: true, orderId, quoteId: order.quote.id, status: QuoteStatus.REJECTED }
  }
}
