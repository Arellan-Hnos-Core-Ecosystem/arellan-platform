"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
class Expense {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(params) {
        return new Expense({
            ...params,
            status: "PENDING_APPROVAL",
            approvedById: null,
            rejectedReason: null,
            approvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    static reconstitute(props) {
        return new Expense(props);
    }
    get id() { return this.props.id; }
    get amount() { return this.props.amount; }
    get status() { return this.props.status; }
    get category() { return this.props.category; }
    get requestedById() { return this.props.requestedById; }
    get orderId() { return this.props.orderId; }
    requiredApprovalLevel() {
        return this.props.amount.requiresApprovalLevel();
    }
    approve(approverId) {
        if (this.props.status !== "PENDING_APPROVAL") {
            throw new Error(`Cannot approve expense in status ${this.props.status}`);
        }
        return new Expense({
            ...this.props,
            status: "APPROVED",
            approvedById: approverId,
            approvedAt: new Date(),
            updatedAt: new Date(),
        });
    }
    reject(approverId, reason) {
        if (this.props.status !== "PENDING_APPROVAL") {
            throw new Error(`Cannot reject expense in status ${this.props.status}`);
        }
        if (!reason?.trim()) {
            throw new Error("Rejection reason is required");
        }
        return new Expense({
            ...this.props,
            status: "REJECTED",
            approvedById: approverId,
            rejectedReason: reason,
            updatedAt: new Date(),
        });
    }
    disburse() {
        if (this.props.status !== "APPROVED") {
            throw new Error("Only APPROVED expenses can be disbursed");
        }
        return new Expense({ ...this.props, status: "DISBURSED", updatedAt: new Date() });
    }
}
exports.Expense = Expense;
//# sourceMappingURL=expense.entity.js.map