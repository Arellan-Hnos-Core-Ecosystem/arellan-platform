import { OrderStatus } from "../../../domain/work-orders/value-objects/order-status.vo";
import { Money } from "../../../domain/work-orders/value-objects/money.vo";
import { IWorkOrderRepository } from "../../../domain/work-orders/ports/i-work-order.repository";

export interface TransitionStatusCommand {
  orderId: string;
  targetStatus: string;
  comment?: string;
  totalPaidSoles?: number;
  requestedById: string;
}

export class TransitionOrderStatusUseCase {
  constructor(private readonly repo: IWorkOrderRepository) {}

  async execute(cmd: TransitionStatusCommand): Promise<void> {
    const order = await this.repo.findById(cmd.orderId);
    if (!order) throw new Error(`Work order ${cmd.orderId} not found`);

    const target = OrderStatus.from(cmd.targetStatus);

    if (target.equals(OrderStatus.DELIVERED)) {
      const paid = Money.of(cmd.totalPaidSoles ?? 0);
      if (!order.canDeliver(paid)) {
        const pending = order.pendingBalance(paid);
        throw new Error(
          `Cannot deliver: pending balance S/. ${pending.toFixed(2)}`
        );
      }
    }

    const updated = order.transitionTo(target);
    await this.repo.update(updated);
  }
}
