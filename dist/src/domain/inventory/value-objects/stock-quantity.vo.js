"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockQuantity = void 0;
class StockQuantity {
    units;
    constructor(units) {
        this.units = units;
        if (!Number.isInteger(units) || units < 0) {
            throw new Error(`Invalid stock quantity: ${units}. Must be a non-negative integer.`);
        }
    }
    static of(units) {
        return new StockQuantity(units);
    }
    static zero() {
        return new StockQuantity(0);
    }
    add(other) {
        return StockQuantity.of(this.units + other.units);
    }
    subtract(other) {
        const result = this.units - other.units;
        if (result < 0) {
            throw new Error(`Insufficient stock: ${this.units} - ${other.units} = ${result}`);
        }
        return StockQuantity.of(result);
    }
    isBelowMinimum(minStock) {
        return this.units < minStock.units;
    }
    isCritical(minStock) {
        return this.units === 0 || this.units <= Math.ceil(minStock.units / 2);
    }
    equals(other) {
        return this.units === other.units;
    }
}
exports.StockQuantity = StockQuantity;
//# sourceMappingURL=stock-quantity.vo.js.map