import { PrismaService } from "../../common/prisma/prisma.service";
import { UserRole, AccountStatus } from "@prisma/client";
export declare class PersonnelService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(requestingUserRole: UserRole, role?: UserRole, status?: AccountStatus, limit?: number, cursor?: string): Promise<{
        data: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            createdAt: Date;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    findOne(id: string, requestingUserId: string, requestingUserRole: UserRole): Promise<{
        id: string;
        email: string;
        mfaEnabled: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, role: UserRole, performedBy: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    updateStatus(id: string, status: AccountStatus): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    getAllSecurityList(requestingUserRole: UserRole): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
    }[]>;
}
