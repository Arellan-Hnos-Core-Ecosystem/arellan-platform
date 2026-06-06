import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "../common/prisma/prisma.service"
import { RealtimeGateway } from "../common/gateway/realtime.gateway"

@Injectable()
export class AuditAnomalyWorker {
  private readonly logger = new Logger(AuditAnomalyWorker.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Cron("0 * * * *")
  async detectAnomalies() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const hour = new Date().getHours()

    if (hour < 7 || hour > 21) {
      const offHoursAccess = await this.prisma.auditLog.findMany({
        where: {
          createdAt: { gte: oneHourAgo },
          entity: { in: ["Finance", "CashboxSession", "Payment", "Invoice"] },
        },
      })
      if (offHoursAccess.length > 0) {
        this.realtimeGateway.emitSecurityAlert({
          type: "OFF_HOURS_FINANCE_ACCESS",
          description: `${offHoursAccess.length} acceso(s) al modulo financiero fuera de horario laboral`,
          severity: "WARNING",
        })
      }
    }

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    const rapidChanges = await this.prisma.auditLog.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: fiveMinAgo },
        action: { in: ["PAYMENTS_CREATED", "FINANCE_CREATED", "CASHBOX_OPENED"] },
      },
      _count: true,
    })

    for (const change of rapidChanges) {
      if (change._count > 5) {
        this.realtimeGateway.emitSecurityAlert({
          type: "RAPID_FINANCE_CHANGES",
          description: `Usuario ${change.userId} realizo ${change._count} cambios financieros en 5 minutos`,
          severity: "CRITICAL",
          userId: change.userId,
        })
      }
    }
  }
}
