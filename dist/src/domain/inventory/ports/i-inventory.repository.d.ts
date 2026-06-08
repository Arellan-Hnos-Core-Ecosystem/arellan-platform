import { InventoryItem, MovementType } from "../entities/inventory-item.entity";
import { StockQuantity } from "../value-objects/stock-quantity.vo";
export interface InventoryFilters {
    search?: string;
    category?: string;
    lowStock?: boolean;
    page?: number;
    pageSize?: number;
}
export interface StockMovementRecord {
    itemId: string;
    type: MovementType;
    quantity: StockQuantity;
    reason: string;
    orderId: string | null;
    justification: string | null;
    createdById: string;
    updatedStock: StockQuantity;
}
export interface IInventoryRepository {
    findById(id: string): Promise<InventoryItem | null>;
    findByCode(code: string): Promise<InventoryItem | null>;
    findAll(filters: InventoryFilters): Promise<{
        data: InventoryItem[];
        total: number;
    }>;
    findBelowMinStock(): Promise<InventoryItem[]>;
    update(item: InventoryItem): Promise<InventoryItem>;
    addMovement(record: StockMovementRecord): Promise<void>;
}
