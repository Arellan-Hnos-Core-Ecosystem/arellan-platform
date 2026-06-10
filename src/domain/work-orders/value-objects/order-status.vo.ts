const VALID_TRANSITIONS: Readonly<Record<string, readonly string[]>> = {
  RECEIVED: ["IN_DIAGNOSIS", "CANCELLED"],
  IN_DIAGNOSIS: ["BUDGETED", "CANCELLED"],
  BUDGETED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "READY", "CANCELLED"],
  IN_REVIEW: ["READY", "IN_PROGRESS", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export class OrderStatus {
  private constructor(readonly value: string) {}

  static readonly RECEIVED = new OrderStatus("RECEIVED");
  static readonly IN_DIAGNOSIS = new OrderStatus("IN_DIAGNOSIS");
  static readonly BUDGETED = new OrderStatus("BUDGETED");
  static readonly IN_PROGRESS = new OrderStatus("IN_PROGRESS");
  static readonly IN_REVIEW = new OrderStatus("IN_REVIEW");
  static readonly READY = new OrderStatus("READY");
  static readonly DELIVERED = new OrderStatus("DELIVERED");
  static readonly CANCELLED = new OrderStatus("CANCELLED");

  static from(value: string): OrderStatus {
    if (!VALID_TRANSITIONS[value]) {
      throw new Error(`Invalid OrderStatus: "${value}"`);
    }
    return new OrderStatus(value);
  }

  canTransitionTo(next: OrderStatus): boolean {
    return (VALID_TRANSITIONS[this.value] ?? []).includes(next.value);
  }

  allowedTransitions(): string[] {
    return [...(VALID_TRANSITIONS[this.value] ?? [])];
  }

  isTerminal(): boolean {
    return this.value === "DELIVERED" || this.value === "CANCELLED";
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }
}
