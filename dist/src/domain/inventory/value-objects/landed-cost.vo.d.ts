export interface PurchaseLineInput {
    itemId: string;
    quantity: number;
    unitCost: number;
}
export interface LandedCostAllocation {
    itemId: string;
    quantity: number;
    baseUnitCost: number;
    customsPerUnit: number;
    commissionPerUnit: number;
    landedUnitCost: number;
}
export interface BlendedCost {
    costPrice: number;
    customsCost: number;
}
export declare class LandedCost {
    private constructor();
    static assertImportDeclaration(isImported: boolean, customs: number): void;
    static assertCommissionRecipient(commissionAmount: number | null | undefined, commissionTo: string | null | undefined): void;
    static allocate(params: {
        lines: PurchaseLineInput[];
        customs: number;
        commissionAmount: number;
    }): LandedCostAllocation[];
    static blendAverageCost(existingStock: number, existingCostPrice: number, existingCustomsCost: number, incomingQty: number, incomingLandedUnitCost: number, incomingCustomsPerUnit: number): BlendedCost;
}
