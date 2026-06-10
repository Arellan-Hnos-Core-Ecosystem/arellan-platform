"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandedCost = void 0;
function round2(value) {
    return Math.round(value * 100) / 100;
}
class LandedCost {
    constructor() { }
    static assertImportDeclaration(isImported, customs) {
        if (isImported && customs <= 0) {
            throw new Error("Compra marcada como importada (isImported=true) debe declarar un costo de aduana (customs) mayor a cero.");
        }
    }
    static assertCommissionRecipient(commissionAmount, commissionTo) {
        const hasAmount = !!commissionAmount && commissionAmount > 0;
        const hasRecipient = !!commissionTo;
        if (hasAmount !== hasRecipient) {
            throw new Error("commissionAmount y commissionTo deben declararse juntos: toda comisión requiere un beneficiario identificado.");
        }
    }
    static allocate(params) {
        const subtotal = params.lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
        return params.lines.map((line) => {
            const lineSubtotal = line.quantity * line.unitCost;
            const share = subtotal > 0 ? lineSubtotal / subtotal : 0;
            const customsPerUnit = line.quantity > 0 ? (params.customs * share) / line.quantity : 0;
            const commissionPerUnit = line.quantity > 0 ? (params.commissionAmount * share) / line.quantity : 0;
            return {
                itemId: line.itemId,
                quantity: line.quantity,
                baseUnitCost: line.unitCost,
                customsPerUnit: round2(customsPerUnit),
                commissionPerUnit: round2(commissionPerUnit),
                landedUnitCost: round2(line.unitCost + customsPerUnit + commissionPerUnit),
            };
        });
    }
    static blendAverageCost(existingStock, existingCostPrice, existingCustomsCost, incomingQty, incomingLandedUnitCost, incomingCustomsPerUnit) {
        const totalQty = existingStock + incomingQty;
        if (totalQty <= 0) {
            return { costPrice: incomingLandedUnitCost, customsCost: incomingCustomsPerUnit };
        }
        const costPrice = (existingStock * existingCostPrice + incomingQty * incomingLandedUnitCost) / totalQty;
        const customsCost = (existingStock * existingCustomsCost + incomingQty * incomingCustomsPerUnit) / totalQty;
        return { costPrice: round2(costPrice), customsCost: round2(customsCost) };
    }
}
exports.LandedCost = LandedCost;
//# sourceMappingURL=landed-cost.vo.js.map