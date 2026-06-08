"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionOrderStatusUseCase = void 0;
const order_status_vo_1 = require("../../../domain/work-orders/value-objects/order-status.vo");
const money_vo_1 = require("../../../domain/work-orders/value-objects/money.vo");
class TransitionOrderStatusUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        const order = await this.repo.findById(cmd.orderId);
        if (!order)
            throw new Error(`Work order ${cmd.orderId} not found`);
        const target = order_status_vo_1.OrderStatus.from(cmd.targetStatus);
        if (target.equals(order_status_vo_1.OrderStatus.DELIVERED)) {
            const paid = money_vo_1.Money.of(cmd.totalPaidSoles ?? 0);
            if (!order.canDeliver(paid)) {
                const pending = order.pendingBalance(paid);
                throw new Error(`Cannot deliver: pending balance S/. ${pending.toFixed(2)}`);
            }
        }
        const updated = order.transitionTo(target);
        await this.repo.update(updated);
    }
}
exports.TransitionOrderStatusUseCase = TransitionOrderStatusUseCase;
//# sourceMappingURL=transition-order-status.use-case.js.map