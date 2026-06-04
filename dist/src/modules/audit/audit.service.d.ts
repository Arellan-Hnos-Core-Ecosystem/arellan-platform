import { PrismaService } from "../../common/prisma/prisma.service";
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        total: number;
        limit: number;
        cursor: string | null;
        hasNextPage: boolean;
    };
}
interface AuditFilters {
    userId?: string;
    action?: string;
    entity?: string;
    from?: string;
    to?: string;
    limit?: number;
    cursor?: string;
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filters: AuditFilters): Promise<PaginatedResult<any>>;
    findOne(id: string): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        userName: string;
        action: string;
        entity: string | null;
        entityId: string | null;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        integrityHash: string | null;
        ipAddress: string;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        severity: import(".prisma/client").$Enums.AuditSeverity;
        userId: string;
    }>;
    getByUser(userId: string, limit?: number, cursor?: string): Promise<PaginatedResult<any>>;
    getByEntity(entity: string, entityId: string, limit?: number, cursor?: string): Promise<PaginatedResult<any>>;
}
export {};
