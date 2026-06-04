import { ApprovalStatus } from "@prisma/client";
export declare class CommissionFilterDto {
    status?: ApprovalStatus;
    personnelId?: string;
    supplierId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
export declare class CreateCommissionDto {
    personnelId: string;
    supplierId?: string;
    purchaseId?: string;
    type: string;
    amount: number;
    percentage?: number;
    notes?: string;
}
export declare class ApproveCommissionDto {
    approverId: string;
}
