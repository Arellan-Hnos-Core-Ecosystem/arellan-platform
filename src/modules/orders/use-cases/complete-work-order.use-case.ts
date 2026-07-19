import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import { createHash } from "crypto"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { QueueName } from "../../../queues/queue-names.enum"
import { OrderStatus } from "@prisma/client"
import { WorkOrder } from "../../../domain/work-orders/entities/work-order.entity"
import { OrderStatus as OrderStatusVO } from "../../../domain/work-orders/value-objects/order-status.vo"

@Injectable()
export class CompleteWorkOrderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: RealtimeGateway,
    @InjectQueue(QueueName.AUDIT_EVENTS) private readonly auditQueue: Queue,
  ) {}

  async execute(orderId: string, params: {
    userId: string
    userName: string
    userRole: string
    odometerOut: number
    technicalNotes: string
    requestedStatus: "READY" | "IN_REVIEW"
  }) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      select: {
        id: true, number: true, status: true, odometerIn: true,
        internalNotes: true, mechanicId: true, startedAt: true,
      },
    })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    // SEC-23: un MECHANIC/TRAINEE sólo finaliza SU OT asignada (identidad del
    // JWT; 404 para no revelar existencia — paridad con SEC-13/SEC-20).
    if (
      (params.userRole === "MECHANIC" || params.userRole === "TRAINEE") &&
      order.mechanicId !== params.userId
    ) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    if (order.status !== OrderStatus.IN_PROGRESS) {
      throw new ConflictException(
        `Solo se puede finalizar trabajo de OT en estado IN_PROGRESS. Estado actual: ${order.status}`,
      )
    }

    WorkOrder.assertOdometerOut(order.odometerIn, params.odometerOut)

    const target = WorkOrder.resolveCompletionTarget(
      OrderStatusVO.from(order.status),
      OrderStatusVO.from(params.requestedStatus),
      params.userRole,
    )
    const effectiveStatus = target.value as OrderStatus

    const now = new Date()
    const noteEntry = `[${now.toISOString()}] ${params.userName}: ${params.technicalNotes}`
    const internalNotes = order.internalNotes ? `${order.internalNotes}\n${noteEntry}` : noteEntry

    const isReady = effectiveStatus === OrderStatus.READY
    const eventName = isReady ? "WORK_COMPLETED" : "SENT_TO_REVIEW"
    const eventDescription = isReady
      ? `${params.userName} finalizó el trabajo y marcó la OT como lista para entrega. Odómetro de salida: ${params.odometerOut} km.`
      : `${params.userName} envió la OT a revisión de calidad del Jefe de Taller. Odómetro de salida: ${params.odometerOut} km.`

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
    ])

    const distanceKm = order.odometerIn != null ? params.odometerOut - order.odometerIn : null
    const durationMinutes = order.startedAt
      ? Math.round((now.getTime() - order.startedAt.getTime()) / 60000)
      : null

    await this.auditQueue.add("mechanic-efficiency", {
      userId: params.userId,
      userName: params.userName,
      role: params.userRole,
      action: "WORK_ORDER_COMPLETED",
      entity: "WorkOrder",
      entityId: orderId,
      beforeState: { status: OrderStatus.IN_PROGRESS, odometerOut: null },
      afterState: { status: effectiveStatus, odometerOut: params.odometerOut },
      integrityHash: createHash("sha256")
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
    })

    this.wsGateway.emitOrderStatusChanged({
      orderId,
      oldStatus: OrderStatus.IN_PROGRESS,
      newStatus: effectiveStatus,
      updatedBy: params.userId,
    })

    if (effectiveStatus === OrderStatus.IN_REVIEW) {
      this.wsGateway.emitQaInspectionRequested({
        orderId,
        orderNumber: order.number,
        mechanicName: params.userName,
        role: params.userRole,
        odometerOut: params.odometerOut,
        technicalNotes: params.technicalNotes,
      })
    }

    return {
      success: true,
      orderId,
      orderNumber: order.number,
      previousStatus: OrderStatus.IN_PROGRESS,
      newStatus: updated.status,
      odometerOut: params.odometerOut,
      completedAt: now.toISOString(),
    }
  }
}
