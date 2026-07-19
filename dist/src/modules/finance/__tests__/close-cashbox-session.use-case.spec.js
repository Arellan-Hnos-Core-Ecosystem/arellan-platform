"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const close_cashbox_session_use_case_1 = require("../use-cases/close-cashbox-session.use-case");
const client_1 = require("@prisma/client");
const USER_ID = "user-1";
const SESSION_ID = "session-1";
function buildSession(openingBalance, transactions) {
    return {
        id: SESSION_ID,
        status: "OPEN",
        openingBalance,
        transactions,
    };
}
describe("CloseCashboxSessionUseCase", () => {
    let useCase;
    let prisma;
    let wsGateway;
    let eventEmitter;
    let alertQueue;
    beforeEach(() => {
        prisma = {
            cashboxSession: {
                findFirst: jest.fn(),
                update: jest.fn().mockResolvedValue({}),
            },
            auditLog: { create: jest.fn().mockResolvedValue({}) },
        };
        wsGateway = {
            emitAnomalyDetected: jest.fn(),
            emitCashboxClosed: jest.fn(),
        };
        eventEmitter = { emit: jest.fn() };
        alertQueue = { add: jest.fn().mockResolvedValue({}) };
        useCase = new close_cashbox_session_use_case_1.CloseCashboxSessionUseCase(prisma, wsGateway, eventEmitter, alertQueue);
    });
    it("throws NotFoundException when there is no open session", async () => {
        prisma.cashboxSession.findFirst.mockResolvedValue(null);
        await expect(useCase.execute(USER_ID, { actualCash: 100 })).rejects.toThrow(common_1.NotFoundException);
    });
    it("level 1 (< S/.5): closes normally without justification", async () => {
        prisma.cashboxSession.findFirst.mockResolvedValue(buildSession(100, [{ type: client_1.TransactionType.PAYMENT, amount: 50 }]));
        const result = await useCase.execute(USER_ID, { actualCash: 150 });
        expect(result.status).toBe("CLOSED_NORMAL");
        expect(result.blocked).toBe(false);
        expect(prisma.cashboxSession.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: SESSION_ID },
            data: expect.objectContaining({ status: "CLOSED_NORMAL" }),
        }));
        expect(eventEmitter.emit).toHaveBeenCalledWith("cashbox.closed", { sessionId: SESSION_ID, status: "CLOSED_NORMAL" });
        expect(wsGateway.emitCashboxClosed).toHaveBeenCalled();
    });
    it("level 2 (S/.5-50): requires justification, throws JUSTIFICATION_REQUIRED if missing", async () => {
        prisma.cashboxSession.findFirst.mockResolvedValue(buildSession(100, [{ type: client_1.TransactionType.PAYMENT, amount: 50 }]));
        await expect(useCase.execute(USER_ID, { actualCash: 130 })).rejects.toThrow(common_1.BadRequestException);
        await expect(useCase.execute(USER_ID, { actualCash: 130 })).rejects.toMatchObject({ response: expect.objectContaining({ error: "JUSTIFICATION_REQUIRED" }) });
    });
    it("level 2 (S/.5-50): closes with discrepancy when justification is provided", async () => {
        prisma.cashboxSession.findFirst.mockResolvedValue(buildSession(100, [{ type: client_1.TransactionType.PAYMENT, amount: 50 }]));
        const result = await useCase.execute(USER_ID, {
            actualCash: 130,
            justificationText: "Faltante por vuelto entregado de mas",
        });
        expect(result.status).toBe("CLOSED_WITH_DISCREPANCY");
        expect(result.blocked).toBe(false);
    });
    it("level 3 (> S/.50): blocks the session, raises a CRITICAL audit log and a P1 alert", async () => {
        prisma.cashboxSession.findFirst.mockResolvedValue(buildSession(100, [{ type: client_1.TransactionType.PAYMENT, amount: 50 }]));
        const result = await useCase.execute(USER_ID, { actualCash: 50 });
        expect(result.status).toBe("BLOCKED");
        expect(result.blocked).toBe(true);
        expect(prisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ action: "CASHBOX_BLOCKED_MAJOR_DISCREPANCY", severity: "CRITICAL" }),
        }));
        expect(alertQueue.add).toHaveBeenCalledWith("cashbox-blocked", expect.any(Object), { priority: 1 });
        expect(wsGateway.emitAnomalyDetected).toHaveBeenCalledWith(expect.objectContaining({ type: "CASHBOX_BLOCKED", severity: "CRITICAL" }));
        expect(eventEmitter.emit).not.toHaveBeenCalledWith("cashbox.closed", expect.anything());
        expect(wsGateway.emitCashboxClosed).not.toHaveBeenCalled();
        expect(prisma.cashboxSession.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.not.objectContaining({ closedAt: expect.anything() }) }));
    });
});
//# sourceMappingURL=close-cashbox-session.use-case.spec.js.map