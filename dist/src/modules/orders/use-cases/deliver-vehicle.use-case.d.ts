import { PrismaService } from "../../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway";
import { PaymentMethod } from "@prisma/client";
export declare class DeliverVehicleUseCase {
    private readonly prisma;
    private readonly wsGateway;
    constructor(prisma: PrismaService, wsGateway: RealtimeGateway);
    execute(orderId: string, params: {
        clientSignature: string;
        deliveredBy: string;
        deliveredByName: string;
        paymentMethod: PaymentMethod;
    }): Promise<{
        success: boolean;
        orderId: string;
        orderNumber: string;
        newStatus: import(".prisma/client").$Enums.OrderStatus;
        deliveredAt: string;
        transactionSessionId: string;
    }>;
}
