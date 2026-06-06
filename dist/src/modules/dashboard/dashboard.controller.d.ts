import { DashboardService } from "./dashboard.service";
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(): Promise<{
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
