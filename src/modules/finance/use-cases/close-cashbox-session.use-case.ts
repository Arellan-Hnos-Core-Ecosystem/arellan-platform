import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Queue } from "bullmq"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { TransactionType } from "@prisma/client"
import { QueueName } from "../../../queues/queue-names.enum"

const DISCREPANCY_MINOR = 5
const DISCREPANCY_MAJOR = 50

@Injectable()
export class CloseCashboxSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: RealtimeGateway,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue(QueueName.ALERT_DISPATCHER) private readonly alertQueue: Queue,
  ) {}

  async execute(userId: string, params: {
    actualCash: number
    justificationText?: string
  }) {
    const session = await this.prisma.cashboxSession.findFirst({
      where: { status: "OPEN" },
      include: { transactions: true },
    })
    if (!session) throw new NotFoundException("No hay sesión de caja abierta para cerrar")

    const paymentSum = session.transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expenseSum = session.transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expected = Number(session.openingBalance) + paymentSum - expenseSum
    const rawDiff = params.actualCash - expected
    const absDiff = Math.abs(rawDiff)

    // 3-level control (Anti-Fraude #2)
    let newStatus: string

    if (absDiff < DISCREPANCY_MINOR) {
      newStatus = "CLOSED_NORMAL"
    } else if (absDiff <= DISCREPANCY_MAJOR) {
      if (!params.justificationText?.trim()) {
        throw new BadRequestException({
          statusCode: 400,
          error: "JUSTIFICATION_REQUIRED",
          message: `Descuadre de S/ ${absDiff.toFixed(2)} requiere justificación obligatoria.`,
        })
      }
      newStatus = "CLOSED_WITH_DISCREPANCY"
    } else {
      newStatus = "BLOCKED"

      await this.prisma.auditLog.create({
        data: {
          userId,
          userName: "system",
          role: "ADMIN" as any,
          action: "CASHBOX_BLOCKED_MAJOR_DISCREPANCY",
          entity: "CashboxSession",
          entityId: session.id,
          severity: "CRITICAL",
          ipAddress: "system",
          metadata: {
            discrepancy: rawDiff,
            absDiff,
            expected,
            actual: params.actualCash,
            sessionId: session.id,
          } as any,
        },
      })

      await this.alertQueue.add(
        "cashbox-blocked",
        {
          type: "CASHBOX_BLOCKED",
          sessionId: session.id,
          discrepancy: rawDiff.toFixed(2),
          expected: expected.toFixed(2),
          actual: params.actualCash.toFixed(2),
          closedBy: userId,
          timestamp: new Date().toISOString(),
        },
        { priority: 1 },
      )

      this.wsGateway.emitAnomalyDetected({
        type: "CASHBOX_BLOCKED",
        description: `Caja bloqueada: descuadre de S/ ${absDiff.toFixed(2)} supera el límite de S/ ${DISCREPANCY_MAJOR}. Requiere override del OWNER.`,
        severity: "CRITICAL",
        sessionId: session.id,
        userId,
      })
    }

    const _closed = await this.prisma.cashboxSession.update({
      where: { id: session.id },
      data: {
        status: newStatus as any,
        closedById: userId,
        actualCash: params.actualCash,
        closingBalance: expected,
        discrepancy: rawDiff,
        justificationText: params.justificationText ?? null,
        ...(newStatus !== "BLOCKED" ? { closedAt: new Date() } : {}),
      },
    })

    if (newStatus !== "BLOCKED") {
      this.eventEmitter.emit("cashbox.closed", { sessionId: session.id, status: newStatus })
      this.wsGateway.emitCashboxClosed({ sessionId: session.id, status: newStatus, closedBy: userId })
    }

    return {
      success: true,
      sessionId: session.id,
      status: newStatus,
      expected,
      actual: params.actualCash,
      discrepancy: rawDiff,
      blocked: newStatus === "BLOCKED",
    }
  }
}
