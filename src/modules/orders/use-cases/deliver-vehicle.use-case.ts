import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { OrderStatus, TransactionType, PaymentMethod } from "@prisma/client"

@Injectable()
export class DeliverVehicleUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: RealtimeGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(orderId: string, params: {
    clientSignature: string
    deliveredBy: string
    deliveredByName: string
    paymentMethod: PaymentMethod
  }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        client: { select: { id: true, firstName: true, lastName: true } },
        vehicle: { select: { plate: true, brand: true, model: true } },
      },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (order.status !== OrderStatus.READY) {
      throw new ConflictException(
        `Solo se puede entregar OT en estado READY. Estado actual: ${order.status}`,
      )
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const session = await this.prisma.cashboxSession.findFirst({
      where: { status: "OPEN", openedAt: { gte: todayStart, lte: todayEnd } },
    })
    if (!session) {
      throw new BadRequestException({
        statusCode: 400,
        error: "NO_OPEN_CASHBOX",
        message: "No hay sesión de caja abierta hoy. Abra la caja antes de registrar entregas.",
      })
    }

    const amount = Number(order.finalAmount ?? order.totalCost ?? 0)

    const [updatedOrder] = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.workOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
          paymentStatus: "PAID",
        },
      })

      await tx.orderStatusHistory.create({
        data: { orderId, status: OrderStatus.DELIVERED, changedBy: params.deliveredBy },
      })

      await tx.financialTransaction.create({
        data: {
          sessionId: session.id,
          type: TransactionType.PAYMENT,
          amount,
          paymentMethod: params.paymentMethod,
          orderId,
          referenceToken: params.clientSignature,
          description: `Pago OT ${order.number} — ${order.vehicle?.plate ?? ""}`,
        },
      })

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
      })

      return [updated]
    })

    this.wsGateway.emitOrderStatusChanged({
      orderId,
      oldStatus: OrderStatus.READY,
      newStatus: OrderStatus.DELIVERED,
      updatedBy: params.deliveredBy,
    })
    this.wsGateway.emitVehicleDelivered({
      orderId,
      orderNumber: order.number,
      clientId: order.clientId,
      vehiclePlate: order.vehicle?.plate ?? "",
      deliveredAt: new Date().toISOString(),
    })
    this.eventEmitter.emit("order.delivered", { orderId })

    return {
      success: true,
      orderId,
      orderNumber: order.number,
      newStatus: updatedOrder.status,
      deliveredAt: new Date().toISOString(),
      transactionSessionId: session.id,
    }
  }
}
