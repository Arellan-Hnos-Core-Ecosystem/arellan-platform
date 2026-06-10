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

  assertCanSendQuote(): void {
    if (this.props.laborCost.amount <= 0 && this.props.partsCost.amount <= 0) {
      throw new Error(
        "Invariante Anti-Fraude: no se puede emitir cotización con laborCost y partsCost ambos en cero",
      );
    }
    if (!this.props.status.equals(OrderStatus.BUDGETED)) {
      throw new Error(
        `Invariante: solo se puede emitir cotización desde estado BUDGETED. Estado actual: ${this.props.status.value}`,
      );
    }
  }

  assertCanSendQuote_totalConsistency(storedTotal: number): void {
    const computed = this.props.laborCost.amount + this.props.partsCost.amount - this.props.discount.amount;
    if (Math.abs(storedTotal - computed) > 0.01) {
      throw new Error(
        `Regla Anti-Fraude: totalCost almacenado (${storedTotal.toFixed(2)}) no coincide con laborCost + partsCost - discount (${computed.toFixed(2)}). Posible manipulación de costos.`,
      );
    }
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

  /**
   * Regla de Segregacion de Funciones QA (Sprint 6):
   * - TRAINEE jamas puede enviar la OT directo a READY; siempre se redirige a IN_REVIEW
   *   para inspeccion del Jefe de Taller.
   * - MECHANIC/ADMIN/OWNER pueden elegir READY (auto-certificacion) o IN_REVIEW
   *   (control de calidad cruzado opcional).
   */
  static resolveCompletionTarget(
    currentStatus: OrderStatus,
    requestedStatus: OrderStatus,
    role: string,
  ): OrderStatus {
    if (!currentStatus.equals(OrderStatus.IN_PROGRESS)) {
      throw new Error(
        `Invariante: solo se puede finalizar el trabajo desde IN_PROGRESS. Estado actual: ${currentStatus.value}`,
      );
    }

    let target = requestedStatus;

    if (role === "TRAINEE") {
      target = OrderStatus.IN_REVIEW;
    } else if (!requestedStatus.equals(OrderStatus.READY) && !requestedStatus.equals(OrderStatus.IN_REVIEW)) {
      throw new Error(
        `Estado solicitado invalido para finalizacion: ${requestedStatus.value}. Debe ser READY o IN_REVIEW.`,
      );
    }

    if (!currentStatus.canTransitionTo(target)) {
      const allowed = currentStatus.allowedTransitions().join(", ") || "ninguno";
      throw new Error(
        `No se puede cambiar de ${currentStatus.value} a ${target.value}. Transiciones permitidas: ${allowed}`,
      );
    }

    return target;
  }

  static assertOdometerOut(odometerIn: number | null, odometerOut: number): void {
    if (odometerIn !== null && odometerOut < odometerIn) {
      throw new Error(
        `Regla Anti-Fraude: el kilometraje de salida (${odometerOut} km) no puede ser menor al kilometraje de ingreso (${odometerIn} km).`,
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
