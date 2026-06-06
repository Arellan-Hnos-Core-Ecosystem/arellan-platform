import { PrismaService } from "../common/prisma/prisma.service";
export declare class MonthlyDiscrepancyWorker {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    monthlyInventoryAudit(): Promise<void>;
}
