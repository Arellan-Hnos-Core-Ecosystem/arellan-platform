import { PurchaseStatus } from "@prisma/client";
export declare class PurchaseFilterDto {
    status?: PurchaseStatus;
    supplierId?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
export declare class PurchaseItemDto {
    itemId: string;
    quantity: number;
    unitCost: number;
    notes?: string;
}
export declare class CreatePurchaseDto {
    supplierId: string;
    items: PurchaseItemDto[];
    tax?: number;
    shipping?: number;
    customs?: number;
    currency?: string;
    isImported?: boolean;
    notes?: string;
    expectedAt?: string;
    commissionAmount?: number;
    commissionTo?: string;
}
export declare class UpdatePurchaseStatusDto {
    status: PurchaseStatus;
}
export declare class ReceiveItemsDto {
    items: ReceiveItemDto[];
}
export declare class ReceiveItemDto {
    itemId: string;
    qty: number;
}
