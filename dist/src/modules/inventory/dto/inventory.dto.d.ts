import { MovementType } from "@prisma/client";
export declare class CreateItemDto {
    sku: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unitPrice: number;
}
export declare class UpdateItemDto {
    sku?: string;
    name?: string;
    category?: string;
    stock?: number;
    minStock?: number;
    unitPrice?: number;
}
export declare class InventoryMovementDto {
    type: MovementType;
    quantity: number;
    orderId?: string;
    justification?: string;
}
