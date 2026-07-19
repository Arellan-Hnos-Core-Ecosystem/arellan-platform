import { NotFoundException } from "@nestjs/common"
import { OrdersService } from "../orders.service"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { ConfigService } from "@nestjs/config"
import { IotBridgeClient } from "../../../common/iot-bridge/iot-bridge.client"
import { OrderStatus } from "@prisma/client"

const ORDER_ID = "order-1"
const ASSIGNED = "mech-1"
const INTRUDER = "mech-2"

const BASE_ORDER = {
  id: ORDER_ID,
  number: "OT-2026-0001",
  status: OrderStatus.IN_PROGRESS,
  mechanicId: ASSIGNED,
  clientId: "client-1",
  vehicleId: "veh-1",
  laborCost: 100,
  photos: [],
}

function buildService() {
  const prisma = {
    workOrder: {
      findUnique: jest.fn().mockResolvedValue({ ...BASE_ORDER }),
      update: jest.fn().mockResolvedValue({ ...BASE_ORDER }),
    },
    workOrderPart: { count: jest.fn().mockResolvedValue(1) },
    workOrderPhoto: {
      count: jest.fn().mockResolvedValue(0),
      findFirst: jest.fn().mockResolvedValue({ id: "photo-1", url: "u" }),
      delete: jest.fn().mockResolvedValue({}),
    },
    workOrderEvent: { create: jest.fn().mockResolvedValue({ id: "ev-1" }) },
    orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
    vehicle: { findUnique: jest.fn().mockResolvedValue({ plate: "ABC-123" }) },
    $transaction: jest.fn(),
  }
  prisma.$transaction.mockImplementation(async (ops: unknown) =>
    Array.isArray(ops) ? Promise.all(ops) : (ops as (tx: unknown) => Promise<unknown>)(prisma),
  )
  const ws = {
    emitOrderStatusChanged: jest.fn(),
    broadcastOrderUpdate: jest.fn(),
  }
  const service = new OrdersService(
    prisma as unknown as PrismaService,
    ws as unknown as RealtimeGateway,
    {} as unknown as ConfigService,
    {} as unknown as IotBridgeClient,
  )
  return { service, prisma }
}

describe("SEC-23 — order mutation assignment scope (HTTP parity with WS)", () => {
  it("blocks a non-assigned mechanic from reporting progress (labor-cost manipulation)", async () => {
    const { service, prisma } = buildService()
    await expect(
      service.reportProgress(
        ORDER_ID,
        { progressPercent: 50, partsInstalled: 1, laborHours: 4 } as never,
        { id: INTRUDER, role: "MECHANIC" },
        "Intruso",
      ),
    ).rejects.toThrow(NotFoundException)
    expect(prisma.workOrderEvent.create).not.toHaveBeenCalled()
    expect(prisma.workOrder.update).not.toHaveBeenCalled()
  })

  it("lets the assigned mechanic report progress", async () => {
    const { service, prisma } = buildService()
    await service.reportProgress(
      ORDER_ID,
      { progressPercent: 50, partsInstalled: 1, laborHours: 0 } as never,
      { id: ASSIGNED, role: "MECHANIC" },
      "Asignado",
    )
    expect(prisma.workOrderEvent.create).toHaveBeenCalled()
  })

  it("blocks a non-assigned TRAINEE from transitioning status", async () => {
    const { service } = buildService()
    await expect(
      service.updateStatus(ORDER_ID, { status: OrderStatus.IN_REVIEW } as never, {
        id: INTRUDER,
        role: "TRAINEE",
      }),
    ).rejects.toThrow(NotFoundException)
  })

  it("lets ADMIN transition any order (management override)", async () => {
    const { service, prisma } = buildService()
    await service.updateStatus(ORDER_ID, { status: OrderStatus.IN_REVIEW } as never, {
      id: "admin-1",
      role: "ADMIN",
    })
    expect(prisma.workOrder.update).toHaveBeenCalled()
  })

  it("blocks a non-assigned mechanic from deleting anti-fraud photo evidence", async () => {
    const { service, prisma } = buildService()
    await expect(
      service.deletePhoto(ORDER_ID, "photo-1", { id: INTRUDER, role: "MECHANIC" }, "Intruso"),
    ).rejects.toThrow(NotFoundException)
    expect(prisma.workOrderPhoto.delete).not.toHaveBeenCalled()
  })

  it("blocks a non-assigned mechanic from editing diagnosis/costs (PATCH)", async () => {
    const { service, prisma } = buildService()
    await expect(
      service.update(ORDER_ID, { diagnosis: "x" } as never, { id: INTRUDER, role: "MECHANIC" }),
    ).rejects.toThrow(NotFoundException)
    expect(prisma.workOrder.update).not.toHaveBeenCalled()
  })
})
