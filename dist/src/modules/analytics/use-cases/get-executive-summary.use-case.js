"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetExecutiveSummaryUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
function round2(value) {
    return Math.round(value * 100) / 100;
}
const QUOTES_EVER_SENT = [
    client_1.QuoteStatus.SENT,
    client_1.QuoteStatus.APPROVED,
    client_1.QuoteStatus.REJECTED,
    client_1.QuoteStatus.EXPIRED,
    client_1.QuoteStatus.CONVERTED,
];
const QUOTES_APPROVED_LIKE = [client_1.QuoteStatus.APPROVED, client_1.QuoteStatus.CONVERTED];
let GetExecutiveSummaryUseCase = class GetExecutiveSummaryUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute() {
        const [cycleTime, quoteConversion, inventoryValuation, cashMargin] = await Promise.all([
            this.getMechanicCycleTime(),
            this.getQuoteConversion(),
            this.getInventoryValuation(),
            this.getCashMargin(),
        ]);
        return {
            cycleTime,
            quoteConversion,
            inventoryValuation,
            cashMargin,
            generatedAt: new Date().toISOString(),
        };
    }
    async getMechanicCycleTime() {
        const readyEntries = await this.prisma.orderStatusHistory.groupBy({
            by: ["orderId"],
            where: { status: client_1.OrderStatus.READY },
            _min: { timestamp: true },
        });
        if (readyEntries.length === 0) {
            return { mechanics: [], overallAvgCycleTimeHours: 0 };
        }
        const readyAtByOrder = new Map(readyEntries
            .filter((e) => e._min.timestamp !== null)
            .map((e) => [e.orderId, e._min.timestamp]));
        const orders = await this.prisma.workOrder.findMany({
            where: { id: { in: Array.from(readyAtByOrder.keys()) }, mechanicId: { not: null } },
            select: { id: true, mechanicId: true, receivedAt: true, mechanic: { select: { name: true } } },
        });
        const byMechanic = new Map();
        for (const order of orders) {
            const readyAt = readyAtByOrder.get(order.id);
            if (!readyAt || !order.mechanicId)
                continue;
            const hours = (readyAt.getTime() - order.receivedAt.getTime()) / 3_600_000;
            if (hours < 0)
                continue;
            const entry = byMechanic.get(order.mechanicId) ?? {
                name: order.mechanic?.name ?? "Sin asignar",
                totalHours: 0,
                count: 0,
            };
            entry.totalHours += hours;
            entry.count += 1;
            byMechanic.set(order.mechanicId, entry);
        }
        const mechanics = Array.from(byMechanic.entries())
            .map(([mechanicId, v]) => ({
            mechanicId,
            mechanicName: v.name,
            ordersCompleted: v.count,
            avgCycleTimeHours: round2(v.totalHours / v.count),
        }))
            .sort((a, b) => a.avgCycleTimeHours - b.avgCycleTimeHours);
        const totalOrders = mechanics.reduce((sum, m) => sum + m.ordersCompleted, 0);
        const overallAvgCycleTimeHours = totalOrders > 0
            ? round2(mechanics.reduce((sum, m) => sum + m.avgCycleTimeHours * m.ordersCompleted, 0) / totalOrders)
            : 0;
        return { mechanics, overallAvgCycleTimeHours };
    }
    async getQuoteConversion() {
        const [quotesSent, quotesApproved] = await Promise.all([
            this.prisma.quote.count({ where: { status: { in: QUOTES_EVER_SENT } } }),
            this.prisma.quote.count({ where: { status: { in: QUOTES_APPROVED_LIKE } } }),
        ]);
        const conversionRatePercent = quotesSent > 0 ? round2((quotesApproved / quotesSent) * 100) : 0;
        return { quotesSent, quotesApproved, conversionRatePercent };
    }
    async getInventoryValuation() {
        const rows = await this.prisma.$queryRaw `
      SELECT COALESCE(SUM("stock" * "costPrice"), 0)::float8 AS total, COUNT(*)::int AS "itemCount"
      FROM inventory_items
      WHERE "isActive" = true
    `;
        const row = rows[0] ?? { total: 0, itemCount: 0 };
        return { totalItems: row.itemCount, totalValuation: round2(row.total) };
    }
    async getCashMargin() {
        const sums = await this.prisma.financialTransaction.groupBy({
            by: ["type"],
            _sum: { amount: true },
        });
        const totalIncome = Number(sums.find((s) => s.type === client_1.TransactionType.PAYMENT)?._sum.amount ?? 0);
        const totalExpenses = Number(sums.find((s) => s.type === client_1.TransactionType.EXPENSE)?._sum.amount ?? 0);
        return {
            totalIncome: round2(totalIncome),
            totalExpenses: round2(totalExpenses),
            netMargin: round2(totalIncome - totalExpenses),
        };
    }
};
exports.GetExecutiveSummaryUseCase = GetExecutiveSummaryUseCase;
exports.GetExecutiveSummaryUseCase = GetExecutiveSummaryUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetExecutiveSummaryUseCase);
//# sourceMappingURL=get-executive-summary.use-case.js.map