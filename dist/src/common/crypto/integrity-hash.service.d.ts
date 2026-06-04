import { ConfigService } from "@nestjs/config";
export declare class IntegrityHashService {
    private readonly config;
    private readonly secretKey;
    constructor(config: ConfigService);
    generateMutationHash(params: {
        entity: string;
        entityId: string;
        action: "CREATE" | "UPDATE" | "DELETE";
        before: Record<string, unknown> | null;
        after: Record<string, unknown> | null;
    }): string;
    verifyAuditLogIntegrity(log: {
        entity: string;
        entityId: string;
        action: string;
        beforeState: Record<string, unknown> | null;
        afterState: Record<string, unknown> | null;
        integrityHash: string;
    }): boolean;
    generatePaymentHash(params: {
        orderId: string;
        amount: number;
        method: string;
        referenceToken: string | null;
    }): string;
}
