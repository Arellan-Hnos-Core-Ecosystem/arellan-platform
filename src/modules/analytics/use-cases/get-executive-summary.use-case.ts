import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { OrderStatus, QuoteStatus, TransactionType } from "@prisma/client"
import type { ExecutiveSummaryReport, MechanicCycleTimeEntry } from "@arellan-hnos/business-intelligence-lab"

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

const QUOTES_EVER_SENT: QuoteStatus[] = [
  QuoteStatus.SENT,
  QuoteStatus.APPROVED,
  QuoteStatus.REJECTED,
  QuoteStatus.EXPIRED,
  QuoteStatus.CONVERTED,
]
const QUOTES_APPROVED_LIKE: QuoteStatus[] = [QuoteStatus.APPROVED, QuoteStatus.CONVERTED]

@Injectable()
export class GetExecutiveSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<Omit<ExecutiveSummaryReport, "cached">> {
    const [cycleTime, quoteConversion, inventoryValuation, cashMargin] = await Promise.all([
      this.getMechanicCycleTime(),
      this.getQuoteConversion(),
      this.getInventoryValuation(),
      this.getCashMargin(),
    ])

    return {
      cycleTime,
      quoteConversion,
      inventoryValuation,
      cashMargin,
      generatedAt: new Date().toISOString(),
    }
  }

  // Tiempo Promedio de Reparacion (RECEIVED -> READY) por mecanico.
  // 1 query agrupada (primer READY por OT) + 1 query acotada a esas OT con
  // join a mechanic.name — evita N+1 y no carga la tabla work_orders completa.
  private async getMechanicCycleTime() {
    const readyEntries = await this.prisma.orderStatusHistory.groupBy({
      by: ["orderId"],
      where: { status: OrderStatus.READY },
      _min: { timestamp: true },
    })

    if (readyEntries.length === 0) {
      return { mechanics: [], overallAvgCycleTimeHours: 0 }
    }

    const readyAtByOrder = new Map(
      readyEntries
        .filter((e) => e._min.timestamp !== null)
        .map((e) => [e.orderId, e._min.timestamp as Date]),
    )

    const orders = await this.prisma.workOrder.findMany({
      where: { id: { in: Array.from(readyAtByOrder.keys()) }, mechanicId: { not: null } },
      select: { id: true, mechanicId: true, receivedAt: true, mechanic: { select: { name: true } } },
    })

    const byMechanic = new Map<string, { name: string; totalHours: number; count: number }>()

    for (const order of orders) {
      const readyAt = readyAtByOrder.get(order.id)
      if (!readyAt || !order.mechanicId) continue

      const hours = (readyAt.getTime() - order.receivedAt.getTime()) / 3_600_000
      if (hours < 0) continue

      const entry = byMechanic.get(order.mechanicId) ?? {
        name: order.mechanic?.name ?? "Sin asignar",
        totalHours: 0,
        count: 0,
      }
      entry.totalHours += hours
      entry.count += 1
      byMechanic.set(order.mechanicId, entry)
    }

    const mechanics: MechanicCycleTimeEntry[] = Array.from(byMechanic.entries())
      .map(([mechanicId, v]) => ({
        mechanicId,
        mechanicName: v.name,
        ordersCompleted: v.count,
        avgCycleTimeHours: round2(v.totalHours / v.count),
      }))
      .sort((a, b) => a.avgCycleTimeHours - b.avgCycleTimeHours)

    const totalOrders = mechanics.reduce((sum, m) => sum + m.ordersCompleted, 0)
    const overallAvgCycleTimeHours = totalOrders > 0
      ? round2(mechanics.reduce((sum, m) => sum + m.avgCycleTimeHours * m.ordersCompleted, 0) / totalOrders)
      : 0

    return { mechanics, overallAvgCycleTimeHours }
  }

  // Tasa de Conversion: cotizaciones APPROVED|CONVERTED / cotizaciones que
  // alguna vez salieron de DRAFT (SENT|APPROVED|REJECTED|EXPIRED|CONVERTED).
  // 2 COUNT agregados en BD (sin traer filas a Node).
  private async getQuoteConversion() {
    const [quotesSent, quotesApproved] = await Promise.all([
      this.prisma.quote.count({ where: { status: { in: QUOTES_EVER_SENT } } }),
      this.prisma.quote.count({ where: { status: { in: QUOTES_APPROVED_LIKE } } }),
    ])

    const conversionRatePercent = quotesSent > 0 ? round2((quotesApproved / quotesSent) * 100) : 0

    return { quotesSent, quotesApproved, conversionRatePercent }
  }

  // Valoracion Real del Inventario: SUM(stock * costPrice blended) en una sola
  // consulta SQL agregada — evita traer cada InventoryItem a memoria.
  private async getInventoryValuation() {
    const rows = await this.prisma.$queryRaw<Array<{ total: number; itemCount: number }>>`
      SELECT COALESCE(SUM("stock" * "costPrice"), 0)::float8 AS total, COUNT(*)::int AS "itemCount"
      FROM inventory_items
      WHERE "isActive" = true
    `
    const row = rows[0] ?? { total: 0, itemCount: 0 }
    return { totalItems: row.itemCount, totalValuation: round2(row.total) }
  }

  // Margen Neto de Caja Chica: ingresos (PAYMENT) - egresos (EXPENSE),
  // 1 GROUP BY agregado sobre financial_transactions.
  private async getCashMargin() {
    const sums = await this.prisma.financialTransaction.groupBy({
      by: ["type"],
      _sum: { amount: true },
    })

    const totalIncome = Number(sums.find((s) => s.type === TransactionType.PAYMENT)?._sum.amount ?? 0)
    const totalExpenses = Number(sums.find((s) => s.type === TransactionType.EXPENSE)?._sum.amount ?? 0)

    return {
      totalIncome: round2(totalIncome),
      totalExpenses: round2(totalExpenses),
      netMargin: round2(totalIncome - totalExpenses),
    }
  }
}
