import { PrismaService } from "../common/prisma/prisma.service";
import { RealtimeGateway } from "../common/gateway/realtime.gateway";
export declare class CashboxReportWorker {
    private readonly prisma;
    private readonly realtimeGateway;
    private readonly logger;
    constructor(prisma: PrismaService, realtimeGateway: RealtimeGateway);
    sendDailyCashboxReport(): Promise<void>;
}
