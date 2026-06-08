export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string = "PEN",
  ) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Invalid money amount: ${amount}`);
    }
  }

  static of(amount: number, currency = "PEN"): Money {
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  static zero(currency = "PEN"): Money {
    return new Money(0, currency);
  }

  static fromDecimal(value: { toString(): string }, currency = "PEN"): Money {
    return Money.of(parseFloat(value.toString()), currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(Math.max(0, this.amount - other.amount), this.currency);
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toFixed(digits = 2): string {
    return this.amount.toFixed(digits);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
