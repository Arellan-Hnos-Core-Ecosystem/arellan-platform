import { NotFoundException, BadRequestException } from "@nestjs/common"
import { CloseCashboxSessionUseCase } from "../use-cases/close-cashbox-session.use-case"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { TransactionType } from "@prisma/client"

const USER_ID = "user-1"
const SESSION_ID = "session-1"

function buildSession(openingBalance: number, transactions: { type: TransactionType; amount: number }[]) {
  return {
    id: SESSION_ID,
    status: "OPEN",
    openingBalance,
    transactions,
  }
}

describe("CloseCashboxSessionUseCase", () => {
  let useCase: CloseCashboxSessionUseCase
  let prisma: {
    cashboxSession: { findFirst: jest.Mock; update: jest.Mock }
    auditLog: { create: jest.Mock }
  }
  let wsGateway: { emitAnomalyDetected: jest.Mock; emitCashboxClosed: jest.Mock }
  let eventEmitter: { emit: jest.Mock }
  let alertQueue: { add: jest.Mock }

  beforeEach(() => {
    prisma = {
      cashboxSession: {
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    }
    wsGateway = {
      emitAnomalyDetected: jest.fn(),
      emitCashboxClosed: jest.fn(),
    }
    eventEmitter = { emit: jest.fn() }
    alertQueue = { add: jest.fn().mockResolvedValue({}) }

    useCase = new CloseCashboxSessionUseCase(
      prisma as unknown as PrismaService,
      wsGateway as unknown as RealtimeGateway,
      eventEmitter as unknown as EventEmitter2,
      alertQueue as any,
    )
  })

  it("throws NotFoundException when there is no open session", async () => {
    prisma.cashboxSession.findFirst.mockResolvedValue(null)

    await expect(useCase.execute(USER_ID, { actualCash: 100 })).rejects.toThrow(NotFoundException)
  })

  it("level 1 (< S/.5): closes normally without justification", async () => {
    // opening 100 + payments 50 - expenses 0 = expected 150, actual 150 -> diff 0
    prisma.cashboxSession.findFirst.mockResolvedValue(
      buildSession(100, [{ type: TransactionType.PAYMENT, amount: 50 }]),
    )

    const result = await useCase.execute(USER_ID, { actualCash: 150 })

    expect(result.status).toBe("CLOSED_NORMAL")
    expect(result.blocked).toBe(false)
    expect(prisma.cashboxSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SESSION_ID },
        data: expect.objectContaining({ status: "CLOSED_NORMAL" }),
      }),
    )
    expect(eventEmitter.emit).toHaveBeenCalledWith("cashbox.closed", { sessionId: SESSION_ID, status: "CLOSED_NORMAL" })
    expect(wsGateway.emitCashboxClosed).toHaveBeenCalled()
  })

  it("level 2 (S/.5-50): requires justification, throws JUSTIFICATION_REQUIRED if missing", async () => {
    // expected 150, actual 130 -> diff 20 (within 5-50 range)
    prisma.cashboxSession.findFirst.mockResolvedValue(
      buildSession(100, [{ type: TransactionType.PAYMENT, amount: 50 }]),
    )

    await expect(useCase.execute(USER_ID, { actualCash: 130 })).rejects.toThrow(BadRequestException)
    await expect(
      useCase.execute(USER_ID, { actualCash: 130 }),
    ).rejects.toMatchObject({ response: expect.objectContaining({ error: "JUSTIFICATION_REQUIRED" }) })
  })

  it("level 2 (S/.5-50): closes with discrepancy when justification is provided", async () => {
    prisma.cashboxSession.findFirst.mockResolvedValue(
      buildSession(100, [{ type: TransactionType.PAYMENT, amount: 50 }]),
    )

    const result = await useCase.execute(USER_ID, {
      actualCash: 130,
      justificationText: "Faltante por vuelto entregado de mas",
    })

    expect(result.status).toBe("CLOSED_WITH_DISCREPANCY")
    expect(result.blocked).toBe(false)
  })

  it("level 3 (> S/.50): blocks the session, raises a CRITICAL audit log and a P1 alert", async () => {
    // expected 150, actual 50 -> diff 100 (> 50)
    prisma.cashboxSession.findFirst.mockResolvedValue(
      buildSession(100, [{ type: TransactionType.PAYMENT, amount: 50 }]),
    )

    const result = await useCase.execute(USER_ID, { actualCash: 50 })

    expect(result.status).toBe("BLOCKED")
    expect(result.blocked).toBe(true)

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "CASHBOX_BLOCKED_MAJOR_DISCREPANCY", severity: "CRITICAL" }),
      }),
    )
    expect(alertQueue.add).toHaveBeenCalledWith("cashbox-blocked", expect.any(Object), { priority: 1 })
    expect(wsGateway.emitAnomalyDetected).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CASHBOX_BLOCKED", severity: "CRITICAL" }),
    )

    // BLOCKED sessions are not announced as "closed" — requires OWNER override first
    expect(eventEmitter.emit).not.toHaveBeenCalledWith("cashbox.closed", expect.anything())
    expect(wsGateway.emitCashboxClosed).not.toHaveBeenCalled()
    expect(prisma.cashboxSession.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.not.objectContaining({ closedAt: expect.anything() }) }),
    )
  })
})
