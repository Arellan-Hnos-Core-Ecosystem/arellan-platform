import { NotFoundException, ConflictException, BadRequestException } from "@nestjs/common"
import { DeliverVehicleUseCase } from "../use-cases/deliver-vehicle.use-case"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { OrderStatus, PaymentMethod } from "@prisma/client"

const ORDER_ID = "order-1"

function buildOrder(status: OrderStatus) {
  return {
    id: ORDER_ID,
    number: "OT-2026-001",
    status,
    finalAmount: 250,
    totalCost: 250,
    clientId: "client-1",
    client: { id: "client-1", firstName: "Juan", lastName: "Perez" },
    vehicle: { plate: "ABC-123", brand: "Toyota", model: "Yaris" },
  }
}

describe("DeliverVehicleUseCase", () => {
  let useCase: DeliverVehicleUseCase
  let prisma: {
    workOrder: { findUnique: jest.Mock }
    cashboxSession: { findFirst: jest.Mock }
    $transaction: jest.Mock
  }
  let tx: {
    workOrder: { update: jest.Mock }
    orderStatusHistory: { create: jest.Mock }
    financialTransaction: { create: jest.Mock }
    workOrderEvent: { create: jest.Mock }
  }
  let wsGateway: { emitOrderStatusChanged: jest.Mock; emitVehicleDelivered: jest.Mock }
  let eventEmitter: { emit: jest.Mock }

  const params = {
    clientSignature: "data:image/png;base64,signature",
    deliveredBy: "user-1",
    deliveredByName: "Recepcionista",
    paymentMethod: PaymentMethod.CASH,
  }

  beforeEach(() => {
    tx = {
      workOrder: { update: jest.fn().mockResolvedValue({ status: OrderStatus.DELIVERED }) },
      orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
      financialTransaction: { create: jest.fn().mockResolvedValue({}) },
      workOrderEvent: { create: jest.fn().mockResolvedValue({}) },
    }

    prisma = {
      workOrder: { findUnique: jest.fn() },
      cashboxSession: { findFirst: jest.fn() },
      $transaction: jest.fn((callback: (tx: unknown) => Promise<unknown>) => callback(tx)),
    }

    wsGateway = {
      emitOrderStatusChanged: jest.fn(),
      emitVehicleDelivered: jest.fn(),
    }
    eventEmitter = { emit: jest.fn() }

    useCase = new DeliverVehicleUseCase(
      prisma as unknown as PrismaService,
      wsGateway as unknown as RealtimeGateway,
      eventEmitter as unknown as EventEmitter2,
    )
  })

  it("throws NotFoundException when the order does not exist", async () => {
    prisma.workOrder.findUnique.mockResolvedValue(null)

    await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(NotFoundException)
  })

  it("throws ConflictException when the order is not in READY status", async () => {
    prisma.workOrder.findUnique.mockResolvedValue(buildOrder(OrderStatus.IN_PROGRESS))

    await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(ConflictException)
  })

  it("throws BadRequestException NO_OPEN_CASHBOX when there is no open cashbox session today", async () => {
    prisma.workOrder.findUnique.mockResolvedValue(buildOrder(OrderStatus.READY))
    prisma.cashboxSession.findFirst.mockResolvedValue(null)

    await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(BadRequestException)
    prisma.cashboxSession.findFirst.mockResolvedValue(null)
    await expect(
      useCase.execute(ORDER_ID, params),
    ).rejects.toMatchObject({ response: expect.objectContaining({ error: "NO_OPEN_CASHBOX" }) })
  })

  it("delivers the vehicle: updates status, registers payment and broadcasts events", async () => {
    prisma.workOrder.findUnique.mockResolvedValue(buildOrder(OrderStatus.READY))
    prisma.cashboxSession.findFirst.mockResolvedValue({ id: "session-1", status: "OPEN" })

    const result = await useCase.execute(ORDER_ID, params)

    expect(result).toMatchObject({
      success: true,
      orderId: ORDER_ID,
      orderNumber: "OT-2026-001",
      newStatus: OrderStatus.DELIVERED,
      transactionSessionId: "session-1",
    })

    expect(tx.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ORDER_ID },
        data: expect.objectContaining({ status: OrderStatus.DELIVERED, paymentStatus: "PAID" }),
      }),
    )
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ orderId: ORDER_ID, status: OrderStatus.DELIVERED }) }),
    )
    expect(tx.financialTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sessionId: "session-1", amount: 250, paymentMethod: PaymentMethod.CASH }),
      }),
    )
    expect(tx.workOrderEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ event: "VEHICLE_DELIVERED", workOrderId: ORDER_ID }),
      }),
    )

    expect(wsGateway.emitOrderStatusChanged).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: ORDER_ID, oldStatus: OrderStatus.READY, newStatus: OrderStatus.DELIVERED }),
    )
    expect(wsGateway.emitVehicleDelivered).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: ORDER_ID, vehiclePlate: "ABC-123" }),
    )
    expect(eventEmitter.emit).toHaveBeenCalledWith("order.delivered", { orderId: ORDER_ID })
  })
})
