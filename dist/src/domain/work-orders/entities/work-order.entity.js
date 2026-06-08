"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrder = void 0;
const money_vo_1 = require("../value-objects/money.vo");
const order_status_vo_1 = require("../value-objects/order-status.vo");
class WorkOrder {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(params) {
        return new WorkOrder({
            ...params,
            mechanicId: null,
            status: order_status_vo_1.OrderStatus.RECEIVED,
            laborCost: money_vo_1.Money.zero(),
            partsCost: money_vo_1.Money.zero(),
            discount: money_vo_1.Money.zero(),
            observations: null,
            completedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    static reconstitute(props) {
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
    get totalCost() {
        return this.props.laborCost.add(this.props.partsCost).subtract(this.props.discount);
    }
    transitionTo(nextStatus) {
        if (!this.props.status.canTransitionTo(nextStatus)) {
            const allowed = this.props.status.allowedTransitions().join(", ") || "ninguno";
            throw new Error(`No se puede cambiar de ${this.props.status.value} a ${nextStatus.value}. ` +
                `Transiciones permitidas: ${allowed}`);
        }
        return new WorkOrder({
            ...this.props,
            status: nextStatus,
            completedAt: nextStatus.equals(order_status_vo_1.OrderStatus.DELIVERED) ? new Date() : this.props.completedAt,
            updatedAt: new Date(),
        });
    }
    assignMechanic(mechanicId) {
        return new WorkOrder({ ...this.props, mechanicId, updatedAt: new Date() });
    }
    applyDiscount(discount) {
        if (discount.isGreaterThan(this.props.laborCost.add(this.props.partsCost))) {
            throw new Error("Discount cannot exceed total cost before discount");
        }
        return new WorkOrder({ ...this.props, discount, updatedAt: new Date() });
    }
    assertCanStartProgress(hasParts) {
        if (!hasParts) {
            throw new Error("Regla Anti-Fraude AF-01: La OT debe tener repuestos asociados antes de iniciar trabajo (IN_PROGRESS)");
        }
    }
    static REQUIRED_CHECKIN_POSITIONS = [
        "FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD",
    ];
    static assertCheckinPhotoPositions(suppliedPositions) {
        const missing = WorkOrder.REQUIRED_CHECKIN_POSITIONS.filter((pos) => !suppliedPositions.includes(pos));
        if (missing.length > 0) {
            throw new Error(`Regla Anti-Fraude #8: Posiciones de fotos faltantes: ${missing.join(", ")}. ` +
                `Requeridas: ${WorkOrder.REQUIRED_CHECKIN_POSITIONS.join(", ")}`);
        }
    }
    canDeliver(totalPaid) {
        return totalPaid.isGreaterThanOrEqual(this.totalCost);
    }
    pendingBalance(totalPaid) {
        const total = this.totalCost;
        if (totalPaid.isGreaterThanOrEqual(total))
            return money_vo_1.Money.zero(total.currency);
        return total.subtract(totalPaid);
    }
}
exports.WorkOrder = WorkOrder;
//# sourceMappingURL=work-order.entity.js.map