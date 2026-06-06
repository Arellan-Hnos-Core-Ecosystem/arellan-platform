import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeGateway } from "../common/gateway/realtime.gateway";
export declare class InventoryAlertWorker {
    private readonly prisma;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    checkInventoryLevels(): Promise<void>;
}
