"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItem = void 0;
const money_vo_1 = require("../../work-orders/value-objects/money.vo");
class InventoryItem {
    props;
    constructor(props) {
        this.props = props;
    }
    static reconstitute(props) {
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
    isBelowMinStock() {
        return this.props.currentStock.isBelowMinimum(this.props.minStock);
    }
    isCriticalStock() {
        return this.props.currentStock.isCritical(this.props.minStock);
    }
    applyMovement(type, quantity) {
        let newStock;
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
    valuationAtCost() {
        return money_vo_1.Money.of(this.props.costPrice.amount * this.props.currentStock.units);
    }
    valuationAtSale() {
        return money_vo_1.Money.of(this.props.salePrice.amount * this.props.currentStock.units);
    }
}
exports.InventoryItem = InventoryItem;
//# sourceMappingURL=inventory-item.entity.js.map