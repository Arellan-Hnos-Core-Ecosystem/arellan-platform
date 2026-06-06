import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "../common/prisma/prisma.service"

@Injectable()
export class MonthlyDiscrepancyWorker {
  private readonly logger = new Logger(MonthlyDiscrepancyWorker.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron("0 9 1 * *")
  async monthlyInventoryAudit() {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    lastMonth.setDate(1)
    lastMonth.setHours(0, 0, 0, 0)
    const thisMonthStart = new Date()
    thisMonthStart.setDate(1)
    thisMonthStart.setHours(0, 0, 0, 0)

    const movements = await this.prisma.inventoryMovement.groupBy({
      by: ["itemId", "type"],
      where: { createdAt: { gte: lastMonth, lt: thisMonthStart } },
      _sum: { quantity: true },
    })

    await this.prisma.auditLog.create({
      data: {
        userId: "system",
        userName: "MonthlyDiscrepancyWorker",
        role: "OWNER" as any,
        action: "MONTHLY_INVENTORY_AUDIT",
        entity: "Inventory",
        severity: "INFO",
        ipAddress: "system",
        metadata: { month: lastMonth.toISOString().slice(0, 7), itemsAudited: movements.length } as any,
      },
    })

    this.logger.log(`Monthly inventory audit: ${movements.length} items audited`)
  }
}
