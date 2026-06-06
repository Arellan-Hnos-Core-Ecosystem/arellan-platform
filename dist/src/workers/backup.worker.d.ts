import { PrismaService } from "../common/prisma/prisma.service";
export declare class BackupWorker {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    dailyBackup(): Promise<void>;
}
