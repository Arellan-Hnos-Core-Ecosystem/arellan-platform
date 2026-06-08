"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStockMovementUseCase = void 0;
const stock_quantity_vo_1 = require("../../../domain/inventory/value-objects/stock-quantity.vo");
class AddStockMovementUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        const item = await this.repo.findById(cmd.itemId);
        if (!item)
            throw new Error(`Inventory item ${cmd.itemId} not found`);
        if (cmd.type === "OUT" && !cmd.orderId) {
            throw new Error("Work order ID is required for OUT stock movements");
        }
        if (cmd.type === "ADJUSTMENT" && !cmd.justification?.trim()) {
            throw new Error("Justification is required for ADJUSTMENT movements");
        }
        const qty = stock_quantity_vo_1.StockQuantity.of(cmd.quantity);
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
exports.AddStockMovementUseCase = AddStockMovementUseCase;
//# sourceMappingURL=add-stock-movement.use-case.js.map