import { PrismaService } from "../../common/prisma/prisma.service";
export declare class AlertsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAlerts(page?: string, pageSize?: string): Promise<{
        data: {
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
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    acknowledgeAlert(id: string): {
        success: boolean;
        id: string;
    };
}
