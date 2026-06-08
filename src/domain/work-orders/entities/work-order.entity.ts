import { Money } from "../value-objects/money.vo";
import { OrderStatus } from "../value-objects/order-status.vo";

export interface WorkOrderProps {
  id: string;
  orderNumber: number;
  clientId: string;
  vehicleId: string;
  mechanicId: string | null;
  status: OrderStatus;
  laborCost: Money;
  partsCost: Money;
  discount: Money;
  description: string;
  observations: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkOrderParams {
  id: string;
  orderNumber: number;
  clientId: string;
  vehicleId: string;
  description: string;
}

export class WorkOrder {
  private constructor(private readonly props: WorkOrderProps) {}

  static create(params: CreateWorkOrderParams): WorkOrder {
    return new WorkOrder({
      ...params,
      mechanicId: null,
      status: OrderStatus.RECEIVED,
      laborCost: Money.zero(),
      partsCost: Money.zero(),
      discount: Money.zero(),
      observations: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: WorkOrderProps): WorkOrder {
    return new WorkOrder(props);
  }

  get id() { return this.props.id; }
  get orderNumber() { return this.props.orderNumber; }
  get clientId() { return this.props.clientId; }
  get vehicleId() { return this.props.vehicleId; }
  get mechanicId() { return this.props.mechanicId; }
  get status() { return this.props.status; }
  get laborCost() { return this.props.laborCost; }
  get partsCost() { return this.props.partsCost; }
  get discount() { return this.props.discount; }
  get description() { return this.props.description; }
  get observations() { return this.props.observations; }
  get completedAt() { return this.props.completedAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  get totalCost(): Money {
    return this.props.laborCost.add(this.props.partsCost).subtract(this.props.discount);
  }

  transitionTo(nextStatus: OrderStatus): WorkOrder {
    if (!this.props.status.canTransitionTo(nextStatus)) {
      const allowed = this.props.status.allowedTransitions().join(", ") || "ninguno";
      throw new Error(
        `No se puede cambiar de ${this.props.status.value} a ${nextStatus.value}. ` +
        `Transiciones permitidas: ${allowed}`
      );
    }
    return new WorkOrder({
      ...this.props,
      status: nextStatus,
      completedAt:
        nextStatus.equals(OrderStatus.DELIVERED) ? new Date() : this.props.completedAt,
      updatedAt: new Date(),
    });
  }

  assignMechanic(mechanicId: string): WorkOrder {
    return new WorkOrder({ ...this.props, mechanicId, updatedAt: new Date() });
  }

  applyDiscount(discount: Money): WorkOrder {
    if (discount.isGreaterThan(this.props.laborCost.add(this.props.partsCost))) {
      throw new Error("Discount cannot exceed total cost before discount");
    }
    return new WorkOrder({ ...this.props, discount, updatedAt: new Date() });
  }

  assertCanStartProgress(hasParts: boolean): void {
    if (!hasParts) {
      throw new Error(
        "Regla Anti-Fraude AF-01: La OT debe tener repuestos asociados antes de iniciar trabajo (IN_PROGRESS)",
      );
    }
  }

  static readonly REQUIRED_CHECKIN_POSITIONS = [
    "FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD",
  ] as const;

  static assertCheckinPhotoPositions(suppliedPositions: string[]): void {
    const missing = WorkOrder.REQUIRED_CHECKIN_POSITIONS.filter(
      (pos) => !suppliedPositions.includes(pos),
    );
    if (missing.length > 0) {
      throw new Error(
        `Regla Anti-Fraude #8: Posiciones de fotos faltantes: ${missing.join(", ")}. ` +
        `Requeridas: ${WorkOrder.REQUIRED_CHECKIN_POSITIONS.join(", ")}`,
      );
    }
  }

  canDeliver(totalPaid: Money): boolean {
    return totalPaid.isGreaterThanOrEqual(this.totalCost);
  }

  pendingBalance(totalPaid: Money): Money {
    const total = this.totalCost;
    if (totalPaid.isGreaterThanOrEqual(total)) return Money.zero(total.currency);
    return total.subtract(totalPaid);
  }
}
