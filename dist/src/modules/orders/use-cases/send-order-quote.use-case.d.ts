import { Queue } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway";
import { FinanceService } from "../../finance/finance.service";
export declare class SendOrderQuoteUseCase {
    private readonly prisma;
    private readonly financeService;
    private readonly wsGateway;
    private readonly notificationsQueue;
    constructor(prisma: PrismaService, financeService: FinanceService, wsGateway: RealtimeGateway, notificationsQueue: Queue);
    execute(orderId: string, params: {
        laborCost: number;
        partsCost: number;
        validDays?: number;
        requestedBy: string;
    }): Promise<{
        success: boolean;
        quoteId: string;
        quoteNumber: string;
        total: number;
        customsCost: number;
        invoiceId: string;
    }>;
}
