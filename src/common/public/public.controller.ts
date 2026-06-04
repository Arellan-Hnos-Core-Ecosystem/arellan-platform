import { Controller, Get, Param, Query } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"

@Controller("public")
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("orders/lookup")
  async lookup(@Query("plate") plate?: string, @Query("code") code?: string) {
    if (plate) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { plate: plate.toUpperCase().trim() },
        include: {
          workOrders: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { statusHistory: { orderBy: { timestamp: "desc" } } },
          },
        },
      })

      if (!vehicle) {
        return { found: false, message: "Vehiculo no encontrado" }
      }

      const order = vehicle.workOrders[0]
      if (!order) return { found: true, vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color }, activeOrder: null }

      return {
        found: true,
        vehicle: { plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model, year: vehicle.year, color: vehicle.color },
        order: {
          id: order.id,
          number: order.number,
          status: order.status,
          description: order.description,
          receivedAt: order.receivedAt,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt,
          statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
        },
      }
    }

    if (code) {
      const order = await this.prisma.workOrder.findUnique({
        where: { number: code.toUpperCase().trim() },
        include: {
          vehicle: true,
          statusHistory: { orderBy: { timestamp: "desc" } },
        },
      })

      if (!order) {
        return { found: false, message: "Orden de trabajo no encontrada" }
      }

      return {
        found: true,
        vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color },
        order: {
          id: order.id,
          number: order.number,
          status: order.status,
          description: order.description,
          receivedAt: order.receivedAt,
          estimatedDelivery: order.estimatedDelivery,
          deliveredAt: order.deliveredAt,
          statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
        },
      }
    }

    return { found: false, message: "Proporciona una placa (plate) o codigo de OT (code)" }
  }

  @Get("orders/:id")
  async getOrder(@Param("id") id: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        vehicle: true,
        statusHistory: { orderBy: { timestamp: "desc" } },
      },
    })

    if (!order) {
      return { found: false, message: "Orden de trabajo no encontrada" }
    }

    return {
      found: true,
      vehicle: { plate: order.vehicle.plate, brand: order.vehicle.brand, model: order.vehicle.model, year: order.vehicle.year, color: order.vehicle.color },
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        description: order.description,
        diagnosis: order.diagnosis,
        totalCost: order.totalCost,
        receivedAt: order.receivedAt,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
        statusHistory: order.statusHistory.map((h) => ({ status: h.status, timestamp: h.timestamp })),
      },
    }
  }

  @Get("orders/number/:orderNumber/status")
  async getOrderByNumber(@Param("orderNumber") orderNumber: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { number: orderNumber.toUpperCase().trim() },
      select: {
        number: true,
        status: true,
        description: true,
        receivedAt: true,
        estimatedDelivery: true,
        deliveredAt: true,
        vehicle: {
          select: { plate: true, brand: true, model: true, year: true, color: true },
        },
        client: {
          select: { firstName: true },
        },
        statusHistory: {
          select: { status: true, timestamp: true },
          orderBy: { timestamp: "asc" },
        },
      },
    })

    if (!order) {
      return { found: false, message: "Orden de trabajo no encontrada" }
    }

    return { found: true, order }
  }
}
