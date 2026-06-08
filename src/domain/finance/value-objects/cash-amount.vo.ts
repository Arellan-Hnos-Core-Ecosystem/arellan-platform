export class CashAmount {
  private constructor(readonly soles: number) {
    if (!Number.isFinite(soles) || soles < 0) {
      throw new Error(`Invalid cash amount: ${soles}`);
    }
  }

  static of(soles: number): CashAmount {
    return new CashAmount(Math.round(soles * 100) / 100);
  }

  static zero(): CashAmount {
    return new CashAmount(0);
  }

  add(other: CashAmount): CashAmount {
    return CashAmount.of(this.soles + other.soles);
  }

  subtract(other: CashAmount): CashAmount {
    return CashAmount.of(Math.max(0, this.soles - other.soles));
  }

  difference(expected: CashAmount): number {
    return Math.round((this.soles - expected.soles) * 100) / 100;
  }

  exceedsDiscrepancyThreshold(threshold = 50): boolean {
    return Math.abs(this.soles) > threshold;
  }

  requiresApprovalLevel(): "FINANCE" | "ADMIN" | "OWNER" | "DUAL" {
    if (this.soles <= 100) return "FINANCE";
    if (this.soles <= 500) return "ADMIN";
    if (this.soles <= 2000) return "OWNER";
    return "DUAL";
  }

  equals(other: CashAmount): boolean {
    return this.soles === other.soles;
  }

  toFixed(digits = 2): string {
    return `S/. ${this.soles.toFixed(digits)}`;
  }
}
