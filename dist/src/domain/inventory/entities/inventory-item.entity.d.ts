import { StockQuantity } from "../value-objects/stock-quantity.vo";
import { Money } from "../../work-orders/value-objects/money.vo";
export type MovementType = "IN" | "OUT" | "ADJUSTMENT";
export interface InventoryItemProps {
    id: string;
    code: string;
    name: string;
    description: string | null;
    brand: string | null;
    category: string | null;
    currentStock: StockQuantity;
    minStock: StockQuantity;
    costPrice: Money;
    salePrice: Money;
    createdAt: Date;
    updatedAt: Date;
}
export declare class InventoryItem {
    private readonly props;
    private constructor();
    static reconstitute(props: InventoryItemProps): InventoryItem;
    get id(): string;
    get code(): string;
    get name(): string;
    get currentStock(): StockQuantity;
    get minStock(): StockQuantity;
    get costPrice(): Money;
    get salePrice(): Money;
    get category(): string | null;
    isBelowMinStock(): boolean;
    isCriticalStock(): boolean;
    applyMovement(type: MovementType, quantity: StockQuantity): InventoryItem;
    valuationAtCost(): Money;
    valuationAtSale(): Money;
}
