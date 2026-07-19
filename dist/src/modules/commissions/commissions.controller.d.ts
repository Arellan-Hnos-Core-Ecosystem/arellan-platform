import { CommissionsService } from "./commissions.service";
import { CommissionFilterDto, CreateCommissionDto, ApproveCommissionDto } from "./dto/commissions.dto";
import { AuthUser } from "../auth/auth.service";
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
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
            status: import("@prisma/client").$Enums.ApprovalStatus;
            createdAt: Date;
            notes: string | null;
            type: string;
            supplierId: string | null;
            personnelId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            purchaseId: string | null;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
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
        status: import("@prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getBySupplier(supplierId: string): Promise<({
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    create(dto: CreateCommissionDto, user: AuthUser): Promise<{
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
        status: import("@prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    approve(id: string, dto: ApproveCommissionDto): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    pay(id: string): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
        notes: string | null;
        type: string;
        supplierId: string | null;
        personnelId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        paidAt: Date | null;
        purchaseId: string | null;
        percentage: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
