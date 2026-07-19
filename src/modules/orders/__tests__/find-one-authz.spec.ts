import { NotFoundException } from "@nestjs/common"
import { OrdersService } from "../orders.service"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { RealtimeGateway } from "../../../common/gateway/realtime.gateway"
import { ConfigService } from "@nestjs/config"
import { IotBridgeClient } from "../../../common/iot-bridge/iot-bridge.client"

const ORDER_ID = "order-1"
const ASSIGNED_MECHANIC = "mech-1"
const OWNING_CLIENT = "client-1"

function buildService(order: unknown) {
  const prisma = {
    workOrder: { findUnique: jest.fn().mockResolvedValue(order) },
  }
  const service = new OrdersService(
    prisma as unknown as PrismaService,
    {} as unknown as RealtimeGateway,
    {} as unknown as ConfigService,
    {} as unknown as IotBridgeClient,
  )
  return { service, prisma }
}

const ORDER = { id: ORDER_ID, mechanicId: ASSIGNED_MECHANIC, clientId: OWNING_CLIENT }

describe("OrdersService.findOne authorization (SEC-20 / BOLA)", () => {
  it("returns 404 when the order does not exist", async () => {
    const { service } = buildService(null)
    await expect(service.findOne(ORDER_ID)).rejects.toThrow(NotFoundException)
  })

  it("lets management (ADMIN/OWNER/FINANCE) read any order", async () => {
    const { service } = buildService(ORDER)
    await expect(service.findOne(ORDER_ID, { id: "someone", role: "ADMIN" })).resolves.toMatchObject({ id: ORDER_ID })
    await expect(service.findOne(ORDER_ID, { id: "someone", role: "FINANCE" })).resolves.toMatchObject({ id: ORDER_ID })
  })

  it("lets the assigned mechanic read their own order", async () => {
    const { service } = buildService(ORDER)
    await expect(
      service.findOne(ORDER_ID, { id: ASSIGNED_MECHANIC, role: "MECHANIC" }),
    ).resolves.toMatchObject({ id: ORDER_ID })
  })

  it("hides another mechanic's order as 404 (no existence leak)", async () => {
    const { service } = buildService(ORDER)
    await expect(
      service.findOne(ORDER_ID, { id: "mech-2", role: "MECHANIC" }),
    ).rejects.toThrow(NotFoundException)
  })

  it("blocks a TRAINEE that is not assigned", async () => {
    const { service } = buildService(ORDER)
    await expect(
      service.findOne(ORDER_ID, { id: "trainee-x", role: "TRAINEE" }),
    ).rejects.toThrow(NotFoundException)
  })

  it("lets the owning client read their own order but blocks others (clientId claim, FUN-18)", async () => {
    const { service } = buildService(ORDER)
    await expect(
      service.findOne(ORDER_ID, { id: "acc-roberto", role: "CLIENT", clientId: OWNING_CLIENT }),
    ).resolves.toMatchObject({ id: ORDER_ID })
    await expect(
      service.findOne(ORDER_ID, { id: "acc-x", role: "CLIENT", clientId: "client-2" }),
    ).rejects.toThrow(NotFoundException)
    // Cuenta CLIENT sin Client enlazado: fail-closed
    await expect(
      service.findOne(ORDER_ID, { id: OWNING_CLIENT, role: "CLIENT" }),
    ).rejects.toThrow(NotFoundException)
  })

  it("keeps internal callers (no requester) unrestricted", async () => {
    const { service } = buildService(ORDER)
    await expect(service.findOne(ORDER_ID)).resolves.toMatchObject({ id: ORDER_ID })
  })
})
