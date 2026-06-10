export interface PurchaseLineInput {
  itemId: string;
  quantity: number;
  unitCost: number;
}

export interface LandedCostAllocation {
  itemId: string;
  quantity: number;
  baseUnitCost: number;
  customsPerUnit: number;
  commissionPerUnit: number;
  landedUnitCost: number;
}

export interface BlendedCost {
  costPrice: number;
  customsCost: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export class LandedCost {
  private constructor() {}

  // Anti-Fraude #2: marcar una compra como importada sin declarar customs > 0
  // permite ocultar ese costo del cálculo de costo real y de la cotización al cliente.
  static assertImportDeclaration(isImported: boolean, customs: number): void {
    if (isImported && customs <= 0) {
      throw new Error(
        "Compra marcada como importada (isImported=true) debe declarar un costo de aduana (customs) mayor a cero.",
      );
    }
  }

  // Anti-Fraude #2: una comisión sin beneficiario identificado es una salida
  // de dinero no auditable — vector clásico de comisión oculta.
  static assertCommissionRecipient(
    commissionAmount: number | null | undefined,
    commissionTo: string | null | undefined,
  ): void {
    const hasAmount = !!commissionAmount && commissionAmount > 0;
    const hasRecipient = !!commissionTo;
    if (hasAmount !== hasRecipient) {
      throw new Error(
        "commissionAmount y commissionTo deben declararse juntos: toda comisión requiere un beneficiario identificado.",
      );
    }
  }

  // Distribuye customs + commission de la compra entre sus líneas, proporcional
  // al peso de cada línea, para que el costo real de cada item sea auditable
  // en vez de quedar como un monto global opaco.
  static allocate(params: {
    lines: PurchaseLineInput[];
    customs: number;
    commissionAmount: number;
  }): LandedCostAllocation[] {
    const subtotal = params.lines.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

    return params.lines.map((line) => {
      const lineSubtotal = line.quantity * line.unitCost;
      const share = subtotal > 0 ? lineSubtotal / subtotal : 0;
      const customsPerUnit = line.quantity > 0 ? (params.customs * share) / line.quantity : 0;
      const commissionPerUnit =
        line.quantity > 0 ? (params.commissionAmount * share) / line.quantity : 0;

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

  // Promedio ponderado del costo existente vs. el costo del nuevo ingreso,
  // para que costPrice/customsCost reflejen el costo real acumulado.
  static blendAverageCost(
    existingStock: number,
    existingCostPrice: number,
    existingCustomsCost: number,
    incomingQty: number,
    incomingLandedUnitCost: number,
    incomingCustomsPerUnit: number,
  ): BlendedCost {
    const totalQty = existingStock + incomingQty;
    if (totalQty <= 0) {
      return { costPrice: incomingLandedUnitCost, customsCost: incomingCustomsPerUnit };
    }

    const costPrice =
      (existingStock * existingCostPrice + incomingQty * incomingLandedUnitCost) / totalQty;
    const customsCost =
      (existingStock * existingCustomsCost + incomingQty * incomingCustomsPerUnit) / totalQty;

    return { costPrice: round2(costPrice), customsCost: round2(customsCost) };
  }
}
