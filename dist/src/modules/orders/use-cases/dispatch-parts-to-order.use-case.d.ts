import { Queue } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";
export declare class DispatchPartsToOrderUseCase {
    private readonly prisma;
    private readonly redis;
    private readonly alertQueue;
    constructor(prisma: PrismaService, redis: RedisService, alertQueue: Queue);
    execute(orderId: string, params: {
        items: Array<{
            itemId: string;
            quantity: number;
        }>;
        requestedBy: string;
        requestedByName: string;
    }): Promise<{
        success: boolean;
        parts: {
            id: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            itemId: string;
            quantity: number;
        }[];
        lowStockAlerts: number;
    }>;
}
