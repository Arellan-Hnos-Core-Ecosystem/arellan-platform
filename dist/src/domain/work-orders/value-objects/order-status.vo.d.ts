export declare class OrderStatus {
    readonly value: string;
    private constructor();
    static readonly RECEIVED: OrderStatus;
    static readonly IN_DIAGNOSIS: OrderStatus;
    static readonly BUDGETED: OrderStatus;
    static readonly IN_PROGRESS: OrderStatus;
    static readonly IN_REVIEW: OrderStatus;
    static readonly READY: OrderStatus;
    static readonly DELIVERED: OrderStatus;
    static readonly CANCELLED: OrderStatus;
    static from(value: string): OrderStatus;
    canTransitionTo(next: OrderStatus): boolean;
    allowedTransitions(): string[];
    isTerminal(): boolean;
    equals(other: OrderStatus): boolean;
}
