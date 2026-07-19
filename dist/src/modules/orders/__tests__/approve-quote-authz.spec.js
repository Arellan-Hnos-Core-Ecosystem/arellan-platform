"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const approve_quote_use_case_1 = require("../use-cases/approve-quote.use-case");
const client_1 = require("@prisma/client");
const ORDER_ID = "order-1";
const OWNING_CLIENT = "client-1";
const ORDER = {
    id: ORDER_ID,
    number: "OT-2026-0001",
    status: client_1.OrderStatus.BUDGETED,
    clientId: OWNING_CLIENT,
    quote: { id: "q-1", number: "QUO-2026-0001", status: client_1.QuoteStatus.SENT },
    parts: [],
    vehicle: { plate: "ABC-123" },
};
function buildUseCase() {
    const prisma = {
        workOrder: { findUnique: jest.fn().mockResolvedValue({ ...ORDER }), update: jest.fn().mockResolvedValue({ ...ORDER, status: client_1.OrderStatus.IN_PROGRESS }) },
        quote: { update: jest.fn().mockResolvedValue({}) },
        orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
        workOrderEvent: { create: jest.fn().mockResolvedValue({}) },
        $transaction: jest.fn(),
    };
    prisma.$transaction.mockImplementation(async (ops) => Array.isArray(ops) ? Promise.all(ops) : ops(prisma));
    const ws = { emitOrderStatusChanged: jest.fn(), broadcastOrderUpdate: jest.fn() };
    const useCase = new approve_quote_use_case_1.ApproveQuoteUseCase(prisma, ws);
    return { useCase, prisma };
}
describe("SEC-23/FUN-18 — quote approval CLIENT ownership", () => {
    it("blocks a CLIENT from approving another client's quote (404, no existence leak)", async () => {
        const { useCase, prisma } = buildUseCase();
        await expect(useCase.execute(ORDER_ID, {
            clientSignature: "sig",
            approverId: "acc-x",
            approverRole: "CLIENT",
            approverClientId: "client-OTHER",
        })).rejects.toThrow(common_1.NotFoundException);
        expect(prisma.quote.update).not.toHaveBeenCalled();
    });
    it("blocks a CLIENT account with no linked Client record (clientId null)", async () => {
        const { useCase } = buildUseCase();
        await expect(useCase.execute(ORDER_ID, {
            clientSignature: "sig",
            approverId: "acc-x",
            approverRole: "CLIENT",
            approverClientId: null,
        })).rejects.toThrow(common_1.NotFoundException);
    });
    it("lets the owning CLIENT approve their own quote", async () => {
        const { useCase, prisma } = buildUseCase();
        const result = await useCase.execute(ORDER_ID, {
            clientSignature: "sig",
            approverId: "acc-roberto",
            approverRole: "CLIENT",
            approverClientId: OWNING_CLIENT,
        });
        expect(result.success).toBe(true);
        expect(prisma.quote.update).toHaveBeenCalled();
    });
    it("does not restrict ADMIN/OWNER staff approvals", async () => {
        const { useCase } = buildUseCase();
        const result = await useCase.execute(ORDER_ID, {
            clientSignature: "sig",
            approverId: "admin-1",
            approverRole: "ADMIN",
            approverClientId: null,
        });
        expect(result.success).toBe(true);
    });
    it("applies the same ownership rule on reject", async () => {
        const { useCase } = buildUseCase();
        await expect(useCase.reject(ORDER_ID, {
            reason: "caro",
            rejectedBy: "acc-x",
            rejectorRole: "CLIENT",
            rejectorClientId: "client-OTHER",
        })).rejects.toThrow(common_1.NotFoundException);
    });
});
//# sourceMappingURL=approve-quote-authz.spec.js.map