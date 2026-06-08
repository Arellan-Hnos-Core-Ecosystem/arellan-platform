export declare class CashAmount {
    readonly soles: number;
    private constructor();
    static of(soles: number): CashAmount;
    static zero(): CashAmount;
    add(other: CashAmount): CashAmount;
    subtract(other: CashAmount): CashAmount;
    difference(expected: CashAmount): number;
    exceedsDiscrepancyThreshold(threshold?: number): boolean;
    requiresApprovalLevel(): "FINANCE" | "ADMIN" | "OWNER" | "DUAL";
    equals(other: CashAmount): boolean;
    toFixed(digits?: number): string;
}
