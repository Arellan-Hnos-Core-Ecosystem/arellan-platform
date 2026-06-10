import { Queue } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway";
export declare class CompleteWorkOrderUseCase {
    private readonly prisma;
    private readonly wsGateway;
    private readonly auditQueue;
    constructor(prisma: PrismaService, wsGateway: RealtimeGateway, auditQueue: Queue);
    execute(orderId: string, params: {
        userId: string;
        userName: string;
        userRole: string;
        odometerOut: number;
        technicalNotes: string;
        requestedStatus: "READY" | "IN_REVIEW";
    }): Promise<{
        success: boolean;
        orderId: string;
        orderNumber: string;
        previousStatus: "IN_PROGRESS";
        newStatus: import(".prisma/client").$Enums.OrderStatus;
        odometerOut: number;
        completedAt: string;
    }>;
}
