import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CommissionFilterDto, CreateCommissionDto } from "./dto/commissions.dto";
export declare class CommissionsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filters: CommissionFilterDto): Promise<{
        data: ({
            personnel: {
                id: string;
                firstName: string;
                lastName: string;
                position: string;
            };
            supplier: {
                id: string;
                name: string;
            } | null;
            purchase: {
                number: string;
                id: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            createdAt: Date;
            notes: string | null;
            type: string;
            supplierId: string | null;
            personnelId: string;
            amount: Prisma.Decimal;
            paidAt: Date | null;
            purchaseId: string | null;
            percentage: Prisma.Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(dto: CreateCommissionDto, requestingUserRole: string, requestingUserId: string): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
        supplier: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: Prisma.Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: Prisma.Decimal | null;
    }>;
    approve(id: string, approverId: string): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: Prisma.Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: Prisma.Decimal | null;
    }>;
    pay(id: string): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: Prisma.Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: Prisma.Decimal | null;
    }>;
    getByPersonnel(personnelId: string): Promise<({
        supplier: {
            id: string;
            name: string;
        } | null;
        purchase: {
            number: string;
            id: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: Prisma.Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: Prisma.Decimal | null;
    })[]>;
    getBySupplier(supplierId: string): Promise<({
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: Prisma.Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: Prisma.Decimal | null;
    })[]>;
}
