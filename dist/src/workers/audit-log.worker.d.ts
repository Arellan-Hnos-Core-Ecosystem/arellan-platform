import { WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "../common/prisma/prisma.service";
interface AuditJobPayload {
    userId: string;
    userName: string;
    role: string;
    action: string;
    entity: string;
    entityId: string | null;
    beforeState: Record<string, unknown> | null;
    afterState: Record<string, unknown> | null;
    integrityHash: string;
    ipAddress: string;
    userAgent: string | null;
    correlationId: string;
    metadata: Record<string, unknown>;
}
export declare class AuditLogWorker extends WorkerHost {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<AuditJobPayload, void, string>): Promise<void>;
    onCompleted(job: Job): void;
    onFailed(job: Job, error: Error): void;
}
export {};
