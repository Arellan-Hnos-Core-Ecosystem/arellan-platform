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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DashboardService = DashboardService_1 = class DashboardService {
    prisma;
    logger = new common_1.Logger(DashboardService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getExecutiveSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(today);
        const [todayRevenue, yesterdayRevenue, activeOrders, pendingApprovals, cashboxOpen,] = await Promise.all([
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
        ]);
        const todayRev = Number(todayRevenue._sum.amount ?? 0);
        const yesterdayRev = Number(yesterdayRevenue._sum.amount ?? 0);
        const revenueChangePercent = yesterdayRev > 0
            ? Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100)
            : todayRev > 0 ? 100 : 0;
        const cashboxBalance = cashboxOpen
            ? Number(cashboxOpen.openingBalance ?? 0) + todayRev
            : 0;
        return {
            todayRevenue: todayRev,
            yesterdayRevenue: yesterdayRev,
            revenueChangePercent,
            activeOrders,
            pendingApprovals,
            cashboxOpen: !!cashboxOpen,
            cashboxBalance,
            lastUpdated: new Date().toISOString(),
        };
    }
    async getPendingApprovalsCount() {
        const count = await this.prisma.approval.count({
            where: { status: "PENDING" },
        });
        return { count };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map