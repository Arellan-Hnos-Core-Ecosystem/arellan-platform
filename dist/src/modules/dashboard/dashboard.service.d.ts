import { PrismaService } from "../../common/prisma/prisma.service";
export declare class DashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getExecutiveSummary(): Promise<{
        todayRevenue: number;
        yesterdayRevenue: number;
        revenueChangePercent: number;
        activeOrders: number;
        pendingApprovals: number;
        cashboxOpen: boolean;
        cashboxBalance: number;
        lastUpdated: string;
    }>;
    getPendingApprovalsCount(): Promise<{
        count: number;
    }>;
}
