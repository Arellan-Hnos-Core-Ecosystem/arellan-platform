import { EventEmitter2 } from "@nestjs/event-emitter";
import { Queue } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway";
export declare class CloseCashboxSessionUseCase {
    private readonly prisma;
    private readonly wsGateway;
    private readonly eventEmitter;
    private readonly alertQueue;
    constructor(prisma: PrismaService, wsGateway: RealtimeGateway, eventEmitter: EventEmitter2, alertQueue: Queue);
    execute(userId: string, params: {
        actualCash: number;
        justificationText?: string;
    }): Promise<{
        success: boolean;
        sessionId: string;
        status: string;
        expected: number;
        actual: number;
        discrepancy: number;
        blocked: boolean;
    }>;
}
