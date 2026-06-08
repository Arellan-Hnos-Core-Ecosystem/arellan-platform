import { MovementType } from "../../../domain/inventory/entities/inventory-item.entity";
import { IInventoryRepository } from "../../../domain/inventory/ports/i-inventory.repository";
export interface AddStockMovementCommand {
    itemId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    orderId?: string;
    justification?: string;
    createdById: string;
}
export declare class AddStockMovementUseCase {
    private readonly repo;
    constructor(repo: IInventoryRepository);
    execute(cmd: AddStockMovementCommand): Promise<void>;
}
