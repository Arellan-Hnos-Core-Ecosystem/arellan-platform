"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashAmount = void 0;
class CashAmount {
    soles;
    constructor(soles) {
        this.soles = soles;
        if (!Number.isFinite(soles) || soles < 0) {
            throw new Error(`Invalid cash amount: ${soles}`);
        }
    }
    static of(soles) {
        return new CashAmount(Math.round(soles * 100) / 100);
    }
    static zero() {
        return new CashAmount(0);
    }
    add(other) {
        return CashAmount.of(this.soles + other.soles);
    }
    subtract(other) {
        return CashAmount.of(Math.max(0, this.soles - other.soles));
    }
    difference(expected) {
        return Math.round((this.soles - expected.soles) * 100) / 100;
    }
    exceedsDiscrepancyThreshold(threshold = 50) {
        return Math.abs(this.soles) > threshold;
    }
    requiresApprovalLevel() {
        if (this.soles <= 100)
            return "FINANCE";
        if (this.soles <= 500)
            return "ADMIN";
        if (this.soles <= 2000)
            return "OWNER";
        return "DUAL";
    }
    equals(other) {
        return this.soles === other.soles;
    }
    toFixed(digits = 2) {
        return `S/. ${this.soles.toFixed(digits)}`;
    }
}
exports.CashAmount = CashAmount;
//# sourceMappingURL=cash-amount.vo.js.map