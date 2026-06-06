import { AuditService } from "./audit.service";
import { AuditFilterDto } from "./dto/audit.dto";
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(filters: AuditFilterDto): Promise<import("./audit.service").PaginatedResult<any>>;
    getByUser(userId: string, limit?: string, cursor?: string): Promise<import("./audit.service").PaginatedResult<any>>;
    getByEntity(entity: string, entityId: string, limit?: string, cursor?: string): Promise<import("./audit.service").PaginatedResult<any>>;
    findOne(id: string): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        entity: string | null;
        entityId: string | null;
        userName: string;
        action: string;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        integrityHash: string | null;
        ipAddress: string;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        severity: import(".prisma/client").$Enums.AuditSeverity;
        userId: string;
    }>;
}
