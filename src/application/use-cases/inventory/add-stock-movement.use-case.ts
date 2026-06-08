import { MovementType } from "../../../domain/inventory/entities/inventory-item.entity";
import { StockQuantity } from "../../../domain/inventory/value-objects/stock-quantity.vo";
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

export class AddStockMovementUseCase {
  constructor(private readonly repo: IInventoryRepository) {}

  async execute(cmd: AddStockMovementCommand): Promise<void> {
    const item = await this.repo.findById(cmd.itemId);
    if (!item) throw new Error(`Inventory item ${cmd.itemId} not found`);

    if (cmd.type === "OUT" && !cmd.orderId) {
      throw new Error("Work order ID is required for OUT stock movements");
    }

    if (cmd.type === "ADJUSTMENT" && !cmd.justification?.trim()) {
      throw new Error("Justification is required for ADJUSTMENT movements");
    }

    const qty = StockQuantity.of(cmd.quantity);
    const updated = item.applyMovement(cmd.type, qty);

    await this.repo.update(updated);
    await this.repo.addMovement({
      itemId: cmd.itemId,
      type: cmd.type,
      quantity: qty,
      reason: cmd.reason,
      orderId: cmd.orderId ?? null,
      justification: cmd.justification ?? null,
      createdById: cmd.createdById,
      updatedStock: updated.currentStock,
    });
  }
}
