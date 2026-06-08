"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    amount;
    currency;
    constructor(amount, currency = "PEN") {
        this.amount = amount;
        this.currency = currency;
        if (!Number.isFinite(amount) || amount < 0) {
            throw new Error(`Invalid money amount: ${amount}`);
        }
    }
    static of(amount, currency = "PEN") {
        return new Money(Math.round(amount * 100) / 100, currency);
    }
    static zero(currency = "PEN") {
        return new Money(0, currency);
    }
    static fromDecimal(value, currency = "PEN") {
        return Money.of(parseFloat(value.toString()), currency);
    }
    add(other) {
        this.assertSameCurrency(other);
        return Money.of(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        this.assertSameCurrency(other);
        return Money.of(Math.max(0, this.amount - other.amount), this.currency);
    }
    isGreaterThan(other) {
        return this.amount > other.amount;
    }
    isGreaterThanOrEqual(other) {
        return this.amount >= other.amount;
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    toFixed(digits = 2) {
        return this.amount.toFixed(digits);
    }
    assertSameCurrency(other) {
        if (this.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map