import { StockQuantity } from "../value-objects/stock-quantity.vo";
import { Money } from "../../work-orders/value-objects/money.vo";

export type MovementType = "IN" | "OUT" | "ADJUSTMENT";

export interface InventoryItemProps {
  id: string;
  code: string;
  name: string;
  description: string | null;
  brand: string | null;
  category: string | null;
  currentStock: StockQuantity;
  minStock: StockQuantity;
  costPrice: Money;
  salePrice: Money;
  createdAt: Date;
  updatedAt: Date;
}

export class InventoryItem {
  private constructor(private readonly props: InventoryItemProps) {}

  static reconstitute(props: InventoryItemProps): InventoryItem {
    return new InventoryItem(props);
  }

  get id() { return this.props.id; }
  get code() { return this.props.code; }
  get name() { return this.props.name; }
  get currentStock() { return this.props.currentStock; }
  get minStock() { return this.props.minStock; }
  get costPrice() { return this.props.costPrice; }
  get salePrice() { return this.props.salePrice; }
  get category() { return this.props.category; }

  isBelowMinStock(): boolean {
    return this.props.currentStock.isBelowMinimum(this.props.minStock);
  }

  isCriticalStock(): boolean {
    return this.props.currentStock.isCritical(this.props.minStock);
  }

  applyMovement(type: MovementType, quantity: StockQuantity): InventoryItem {
    let newStock: StockQuantity;
    switch (type) {
      case "IN":
        newStock = this.props.currentStock.add(quantity);
        break;
      case "OUT":
        newStock = this.props.currentStock.subtract(quantity);
        break;
      case "ADJUSTMENT":
        newStock = quantity;
        break;
    }
    return new InventoryItem({ ...this.props, currentStock: newStock, updatedAt: new Date() });
  }

  valuationAtCost(): Money {
    return Money.of(this.props.costPrice.amount * this.props.currentStock.units);
  }

  valuationAtSale(): Money {
    return Money.of(this.props.salePrice.amount * this.props.currentStock.units);
  }
}
