export class StockQuantity {
  private constructor(readonly units: number) {
    if (!Number.isInteger(units) || units < 0) {
      throw new Error(`Invalid stock quantity: ${units}. Must be a non-negative integer.`);
    }
  }

  static of(units: number): StockQuantity {
    return new StockQuantity(units);
  }

  static zero(): StockQuantity {
    return new StockQuantity(0);
  }

  add(other: StockQuantity): StockQuantity {
    return StockQuantity.of(this.units + other.units);
  }

  subtract(other: StockQuantity): StockQuantity {
    const result = this.units - other.units;
    if (result < 0) {
      throw new Error(`Insufficient stock: ${this.units} - ${other.units} = ${result}`);
    }
    return StockQuantity.of(result);
  }

  isBelowMinimum(minStock: StockQuantity): boolean {
    return this.units < minStock.units;
  }

  isCritical(minStock: StockQuantity): boolean {
    return this.units === 0 || this.units <= Math.ceil(minStock.units / 2);
  }

  equals(other: StockQuantity): boolean {
    return this.units === other.units;
  }
}
