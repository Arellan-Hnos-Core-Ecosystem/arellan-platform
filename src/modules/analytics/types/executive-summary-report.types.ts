import type { MechanicCycleTimeReport } from "../../../domain/work-orders/types/mechanic-performance.types"
import type { QuoteConversionReport, CashMarginReport } from "../../../domain/finance/types/financial-health.types"
import type { InventoryValuationReport } from "../../../domain/inventory/types/inventory-valuation.types"

export interface ExecutiveSummaryReport {
  cycleTime: MechanicCycleTimeReport
  quoteConversion: QuoteConversionReport
  inventoryValuation: InventoryValuationReport
  cashMargin: CashMarginReport
  generatedAt: string
  cached: boolean
}
