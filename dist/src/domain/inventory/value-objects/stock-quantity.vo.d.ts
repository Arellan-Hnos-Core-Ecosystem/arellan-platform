export declare class StockQuantity {
    readonly units: number;
    private constructor();
    static of(units: number): StockQuantity;
    static zero(): StockQuantity;
    add(other: StockQuantity): StockQuantity;
    subtract(other: StockQuantity): StockQuantity;
    isBelowMinimum(minStock: StockQuantity): boolean;
    isCritical(minStock: StockQuantity): boolean;
    equals(other: StockQuantity): boolean;
}
