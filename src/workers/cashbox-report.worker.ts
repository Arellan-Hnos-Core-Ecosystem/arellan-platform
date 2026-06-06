import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "../common/prisma/prisma.service"
import { RealtimeGateway } from "../common/gateway/realtime.gateway"

@Injectable()
export class CashboxReportWorker {
  private readonly logger = new Logger(CashboxReportWorker.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Cron("0 20 * * 1-6")
  async sendDailyCashboxReport() {
    this.logger.log("Generating daily cashbox report...")
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [payments, expenses, session, orders] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { paidAt: { gte: today } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expenseAuthorization.aggregate({
        where: { createdAt: { gte: today }, status: "DISBURSED" },
        _sum: { amount: true },
      }),
      this.prisma.cashboxSession.findFirst({
        where: { openedAt: { gte: today } },
        orderBy: { openedAt: "desc" },
      }),
      this.prisma.workOrder.count({
        where: { status: { in: ["IN_DIAGNOSIS", "IN_PROGRESS", "IN_REVIEW", "BUDGETED"] } },
      }),
    ])

    const report = {
      date: today.toISOString().split("T")[0],
      ingresos: Number(payments._sum.amount ?? 0),
      egresos: Number(expenses._sum.amount ?? 0),
      saldoNeto: Number(payments._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0),
      transacciones: payments._count,
      otsActivas: orders,
      discrepancia: (session as any)?.discrepancy ?? 0,
      estadoCaja: (session as any)?.status ?? "NO_SESSION",
    }

    this.realtimeGateway.emitSecurityAlert({
      type: "CASHBOX_DAILY_REPORT",
      description: `Reporte de caja: Ingresos S/.${report.ingresos.toFixed(2)} | Neto S/.${report.saldoNeto.toFixed(2)}`,
      severity: "INFO",
    })

    await this.prisma.auditLog.create({
      data: {
        userId: "system",
        userName: "CashboxReportWorker",
        role: "OWNER" as any,
        action: "CASHBOX_DAILY_REPORT_SENT",
        entity: "CashboxSession",
        severity: "INFO",
        ipAddress: "system",
        metadata: report as any,
      },
    })

    this.logger.log(`Daily cashbox report sent. Ingresos: S/.${report.ingresos}`)
  }
}
