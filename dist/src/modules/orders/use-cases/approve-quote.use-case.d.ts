import { PrismaService } from "../../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway";
export declare class ApproveQuoteUseCase {
    private readonly prisma;
    private readonly wsGateway;
    constructor(prisma: PrismaService, wsGateway: RealtimeGateway);
    private static assertClientOwnership;
    execute(orderId: string, params: {
        clientSignature: string;
        approverId: string;
        approverRole?: string;
        approverClientId?: string | null;
    }): Promise<{
        success: boolean;
        orderId: string;
        orderNumber: string;
        newStatus: import("@prisma/client").$Enums.OrderStatus;
        quoteId: string;
        approvedAt: string;
    }>;
    reject(orderId: string, params: {
        reason: string;
        rejectedBy: string;
        rejectorRole?: string;
        rejectorClientId?: string | null;
    }): Promise<{
        success: boolean;
        orderId: string;
        quoteId: string;
        status: "REJECTED";
    }>;
}
