import { LandedCost } from "./landed-cost.vo"

describe("LandedCost", () => {
  describe("assertImportDeclaration", () => {
    it("throws when isImported=true and customs <= 0 (Anti-Fraude #2)", () => {
      expect(() => LandedCost.assertImportDeclaration(true, 0)).toThrow(
        /debe declarar un costo de aduana/,
      )
      expect(() => LandedCost.assertImportDeclaration(true, -10)).toThrow()
    })

    it("does not throw when isImported=true and customs > 0", () => {
      expect(() => LandedCost.assertImportDeclaration(true, 100)).not.toThrow()
    })

    it("does not throw when isImported=false regardless of customs", () => {
      expect(() => LandedCost.assertImportDeclaration(false, 0)).not.toThrow()
    })
  })

  describe("assertCommissionRecipient", () => {
    it("throws when commissionAmount is set but commissionTo is missing", () => {
      expect(() => LandedCost.assertCommissionRecipient(100, null)).toThrow(
        /deben declararse juntos/,
      )
    })

    it("throws when commissionTo is set but commissionAmount is missing", () => {
      expect(() => LandedCost.assertCommissionRecipient(null, "PROVEEDOR-1")).toThrow()
    })

    it("does not throw when both are present", () => {
      expect(() => LandedCost.assertCommissionRecipient(100, "PROVEEDOR-1")).not.toThrow()
    })

    it("does not throw when both are absent", () => {
      expect(() => LandedCost.assertCommissionRecipient(null, null)).not.toThrow()
      expect(() => LandedCost.assertCommissionRecipient(0, null)).not.toThrow()
    })
  })

  describe("allocate", () => {
    it("distributes customs and commission proportionally to line subtotal weight", () => {
      const result = LandedCost.allocate({
        lines: [
          { itemId: "A", quantity: 10, unitCost: 10 }, // subtotal 100
          { itemId: "B", quantity: 5, unitCost: 20 }, // subtotal 100
        ],
        customs: 100,
        commissionAmount: 20,
      })

      expect(result).toHaveLength(2)
      // Both lines have equal subtotal (100/200 = 50% share each)
      expect(result[0].customsPerUnit).toBeCloseTo(5, 2) // 50% of 100 / 10 units
      expect(result[0].commissionPerUnit).toBeCloseTo(1, 2) // 50% of 20 / 10 units
      expect(result[0].landedUnitCost).toBeCloseTo(16, 2) // 10 + 5 + 1

      expect(result[1].customsPerUnit).toBeCloseTo(10, 2) // 50% of 100 / 5 units
      expect(result[1].commissionPerUnit).toBeCloseTo(2, 2) // 50% of 20 / 5 units
      expect(result[1].landedUnitCost).toBeCloseTo(32, 2) // 20 + 10 + 2
    })

    it("returns zero allocations when subtotal is zero", () => {
      const result = LandedCost.allocate({
        lines: [{ itemId: "A", quantity: 0, unitCost: 0 }],
        customs: 100,
        commissionAmount: 20,
      })

      expect(result[0].customsPerUnit).toBe(0)
      expect(result[0].commissionPerUnit).toBe(0)
      expect(result[0].landedUnitCost).toBe(0)
    })
  })

  describe("blendAverageCost", () => {
    it("returns the incoming cost when there is no existing stock", () => {
      const result = LandedCost.blendAverageCost(0, 0, 0, 10, 16, 5)
      expect(result).toEqual({ costPrice: 16, customsCost: 5 })
    })

    it("computes a weighted average between existing and incoming stock", () => {
      // existing: 10 units @ costPrice 10, customsCost 2
      // incoming: 10 units @ landedUnitCost 20, customsPerUnit 6
      const result = LandedCost.blendAverageCost(10, 10, 2, 10, 20, 6)

      expect(result.costPrice).toBeCloseTo(15, 2) // (10*10 + 10*20) / 20
      expect(result.customsCost).toBeCloseTo(4, 2) // (10*2 + 10*6) / 20
    })
  })
})
