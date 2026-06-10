"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
const VALID_TRANSITIONS = {
    RECEIVED: ["IN_DIAGNOSIS", "CANCELLED"],
    IN_DIAGNOSIS: ["BUDGETED", "CANCELLED"],
    BUDGETED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["IN_REVIEW", "READY", "CANCELLED"],
    IN_REVIEW: ["READY", "IN_PROGRESS", "CANCELLED"],
    READY: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
};
class OrderStatus {
    value;
    constructor(value) {
        this.value = value;
    }
    static RECEIVED = new OrderStatus("RECEIVED");
    static IN_DIAGNOSIS = new OrderStatus("IN_DIAGNOSIS");
    static BUDGETED = new OrderStatus("BUDGETED");
    static IN_PROGRESS = new OrderStatus("IN_PROGRESS");
    static IN_REVIEW = new OrderStatus("IN_REVIEW");
    static READY = new OrderStatus("READY");
    static DELIVERED = new OrderStatus("DELIVERED");
    static CANCELLED = new OrderStatus("CANCELLED");
    static from(value) {
        if (!VALID_TRANSITIONS[value]) {
            throw new Error(`Invalid OrderStatus: "${value}"`);
        }
        return new OrderStatus(value);
    }
    canTransitionTo(next) {
        return (VALID_TRANSITIONS[this.value] ?? []).includes(next.value);
    }
    allowedTransitions() {
        return [...(VALID_TRANSITIONS[this.value] ?? [])];
    }
    isTerminal() {
        return this.value === "DELIVERED" || this.value === "CANCELLED";
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.OrderStatus = OrderStatus;
//# sourceMappingURL=order-status.vo.js.map