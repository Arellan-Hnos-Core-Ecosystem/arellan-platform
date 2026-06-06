import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getExecutiveSummary() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayEnd = new Date(today)

    const [
      todayRevenue,
      yesterdayRevenue,
      activeOrders,
      pendingApprovals,
      cashboxOpen,
    ] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: { type: "PAYMENT", createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
      this.prisma.financialTransaction.aggregate({
        where: { type: "PAYMENT", createdAt: { gte: yesterday, lt: yesterdayEnd } },
        _sum: { amount: true },
      }),
      this.prisma.workOrder.count({
        where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      }),
      this.prisma.approval.count({
        where: { status: "PENDING" },
      }),
      this.prisma.cashboxSession.findFirst({
        where: { openedAt: { gte: today }, status: "OPEN" },
        select: { id: true, openingBalance: true },
      }),
    ])

    const todayRev = Number(todayRevenue._sum.amount ?? 0)
    const yesterdayRev = Number(yesterdayRevenue._sum.amount ?? 0)
    const revenueChangePercent = yesterdayRev > 0
      ? Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100)
      : todayRev > 0 ? 100 : 0

    const cashboxBalance = cashboxOpen
      ? Number(cashboxOpen.openingBalance ?? 0) + todayRev
      : 0

    return {
      todayRevenue: todayRev,
      yesterdayRevenue: yesterdayRev,
      revenueChangePercent,
      activeOrders,
      pendingApprovals,
      cashboxOpen: !!cashboxOpen,
      cashboxBalance,
      lastUpdated: new Date().toISOString(),
    }
  }

  async getPendingApprovalsCount() {
    const count = await this.prisma.approval.count({
      where: { status: "PENDING" },
    })
    return { count }
  }
}
