"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const deliver_vehicle_use_case_1 = require("../use-cases/deliver-vehicle.use-case");
const client_1 = require("@prisma/client");
const ORDER_ID = "order-1";
function buildOrder(status) {
    return {
        id: ORDER_ID,
        number: "OT-2026-001",
        status,
        finalAmount: 250,
        totalCost: 250,
        clientId: "client-1",
        client: { id: "client-1", firstName: "Juan", lastName: "Perez" },
        vehicle: { plate: "ABC-123", brand: "Toyota", model: "Yaris" },
    };
}
describe("DeliverVehicleUseCase", () => {
    let useCase;
    let prisma;
    let tx;
    let wsGateway;
    let eventEmitter;
    const params = {
        clientSignature: "data:image/png;base64,signature",
        deliveredBy: "user-1",
        deliveredByName: "Recepcionista",
        paymentMethod: client_1.PaymentMethod.CASH,
    };
    beforeEach(() => {
        tx = {
            workOrder: { update: jest.fn().mockResolvedValue({ status: client_1.OrderStatus.DELIVERED }) },
            orderStatusHistory: { create: jest.fn().mockResolvedValue({}) },
            financialTransaction: { create: jest.fn().mockResolvedValue({}) },
            workOrderEvent: { create: jest.fn().mockResolvedValue({}) },
        };
        prisma = {
            workOrder: { findUnique: jest.fn() },
            cashboxSession: { findFirst: jest.fn() },
            $transaction: jest.fn((callback) => callback(tx)),
        };
        wsGateway = {
            emitOrderStatusChanged: jest.fn(),
            emitVehicleDelivered: jest.fn(),
        };
        eventEmitter = { emit: jest.fn() };
        useCase = new deliver_vehicle_use_case_1.DeliverVehicleUseCase(prisma, wsGateway, eventEmitter);
    });
    it("throws NotFoundException when the order does not exist", async () => {
        prisma.workOrder.findUnique.mockResolvedValue(null);
        await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(common_1.NotFoundException);
    });
    it("throws ConflictException when the order is not in READY status", async () => {
        prisma.workOrder.findUnique.mockResolvedValue(buildOrder(client_1.OrderStatus.IN_PROGRESS));
        await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(common_1.ConflictException);
    });
    it("throws BadRequestException NO_OPEN_CASHBOX when there is no open cashbox session today", async () => {
        prisma.workOrder.findUnique.mockResolvedValue(buildOrder(client_1.OrderStatus.READY));
        prisma.cashboxSession.findFirst.mockResolvedValue(null);
        await expect(useCase.execute(ORDER_ID, params)).rejects.toThrow(common_1.BadRequestException);
        prisma.cashboxSession.findFirst.mockResolvedValue(null);
        await expect(useCase.execute(ORDER_ID, params)).rejects.toMatchObject({ response: expect.objectContaining({ error: "NO_OPEN_CASHBOX" }) });
    });
    it("delivers the vehicle: updates status, registers payment and broadcasts events", async () => {
        prisma.workOrder.findUnique.mockResolvedValue(buildOrder(client_1.OrderStatus.READY));
        prisma.cashboxSession.findFirst.mockResolvedValue({ id: "session-1", status: "OPEN" });
        const result = await useCase.execute(ORDER_ID, params);
        expect(result).toMatchObject({
            success: true,
            orderId: ORDER_ID,
            orderNumber: "OT-2026-001",
            newStatus: client_1.OrderStatus.DELIVERED,
            transactionSessionId: "session-1",
        });
        expect(tx.workOrder.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: ORDER_ID },
            data: expect.objectContaining({ status: client_1.OrderStatus.DELIVERED, paymentStatus: "PAID" }),
        }));
        expect(tx.orderStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ orderId: ORDER_ID, status: client_1.OrderStatus.DELIVERED }) }));
        expect(tx.financialTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ sessionId: "session-1", amount: 250, paymentMethod: client_1.PaymentMethod.CASH }),
        }));
        expect(tx.workOrderEvent.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ event: "VEHICLE_DELIVERED", workOrderId: ORDER_ID }),
        }));
        expect(wsGateway.emitOrderStatusChanged).toHaveBeenCalledWith(expect.objectContaining({ orderId: ORDER_ID, oldStatus: client_1.OrderStatus.READY, newStatus: client_1.OrderStatus.DELIVERED }));
        expect(wsGateway.emitVehicleDelivered).toHaveBeenCalledWith(expect.objectContaining({ orderId: ORDER_ID, vehiclePlate: "ABC-123" }));
        expect(eventEmitter.emit).toHaveBeenCalledWith("order.delivered", { orderId: ORDER_ID });
    });
});
//# sourceMappingURL=deliver-vehicle.use-case.spec.js.map