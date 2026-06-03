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
        userId: string;
        action: string;
        entity: string | null;
        userName: string;
        entityId: string | null;
        beforeState: import("@prisma/client/runtime/library").JsonValue | null;
        afterState: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string;
        userAgent: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
