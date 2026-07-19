import { PrismaService } from "../prisma/prisma.service";
import { IntegrityHashService } from "../crypto/integrity-hash.service";
export interface FraudCheckContext {
    userId: string;
    userName?: string;
    userRole: string;
    ipAddress: string;
    method: string;
    url: string;
    body?: Record<string, unknown>;
    action: string;
    entity: string;
    entityId?: string;
}
export interface FraudAlert {
    id: string;
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    description: string;
    details: Record<string, unknown>;
    timestamp: string;
    userId: string;
    ipAddress: string;
    immutableHash: string;
}
export declare class AntiFraudService {
    private readonly prisma;
    private readonly integrityHash;
    private readonly logger;
    constructor(prisma: PrismaService, integrityHash: IntegrityHashService);
    audit(ctx: FraudCheckContext): Promise<FraudAlert[]>;
    private checkYapeDiversion;
    private checkInventoryManipulation;
    private checkHighValueMutation;
    private checkSuspiciousAccessPattern;
    persistAlert(alert: FraudAlert, ctx: FraudCheckContext): Promise<void>;
    private buildAlert;
}
