import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { OrderStatus, Prisma } from "@prisma/client"
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto, PaginatedResult } from "./dto/orders.dto"
import { OrdersGateway } from "../../gateways/orders.gateway"

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: [OrderStatus.IN_DIAGNOSIS, OrderStatus.CANCELLED],
  IN_DIAGNOSIS: [OrderStatus.BUDGETED, OrderStatus.CANCELLED],
  BUDGETED: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  IN_PROGRESS: [OrderStatus.IN_REVIEW, OrderStatus.CANCELLED],
  IN_REVIEW: [OrderStatus.READY, OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
  READY: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
}

const ORDER_INCLUDE = {
  vehicle: true,
  client: true,
  mechanic: {
    select: { id: true, name: true, email: true, role: true },
  },
} satisfies Prisma.WorkOrderInclude

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: OrdersGateway,
  ) {}

  async create(dto: CreateOrderDto) {
    const year = new Date().getFullYear()
    const count = await this.prisma.workOrder.count({
      where: { number: { startsWith: `OT-${year}-` } },
    })

    const number = `OT-${year}-${String(count + 1).padStart(4, "0")}`

    const order = await this.prisma.workOrder.create({
      data: {
        number,
        vehicleId: dto.vehicleId,
        clientId: dto.clientId,
        mechanicId: dto.mechanicId,
        description: dto.description,
      },
      include: ORDER_INCLUDE,
    })

    this.logger.log(`OT ${number} creada`)
    return order
  }

  async findAll(filters: OrderFilterDto): Promise<PaginatedResult<unknown>> {
    const { status, mechanicId, from, to, limit = 20, cursor } = filters

    const where: Prisma.WorkOrderWhereInput = {}

    if (status) {
      where.status = status
    }
    if (mechanicId) {
      where.mechanicId = mechanicId
    }
    if (from || to) {
      where.receivedAt = {}
      if (from) where.receivedAt.gte = new Date(from)
      if (to) where.receivedAt.lte = new Date(to)
    }

    const take = limit + 1

    const orders = await this.prisma.workOrder.findMany({
      where,
      take,
      orderBy: { id: "asc" },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: ORDER_INCLUDE,
    })

    const hasMore = orders.length > limit
    const data = hasMore ? orders.slice(0, limit) : orders
    const nextCursor = hasMore ? data[data.length - 1].id : null

    return { data, nextCursor }
  }

  async findOne(id: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        ...ORDER_INCLUDE,
        photos: true,
        parts: { include: { item: true } },
        statusHistory: { orderBy: { timestamp: "desc" } },
      },
    })

    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    return order
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    if (dto.status && order.status === OrderStatus.CANCELLED) {
      throw new ConflictException("No se puede modificar una orden cancelada")
    }

    const data: Prisma.WorkOrderUpdateInput = {}

    if (dto.status !== undefined) {
      data.status = dto.status
    }
    if (dto.diagnosis !== undefined) {
      data.diagnosis = dto.diagnosis
    }
    if (dto.laborCost !== undefined) {
      data.laborCost = new Prisma.Decimal(dto.laborCost)
    }
    if (dto.partsCost !== undefined) {
      data.partsCost = new Prisma.Decimal(dto.partsCost)
    }
    if (dto.estimatedDelivery !== undefined) {
      data.estimatedDelivery = new Date(dto.estimatedDelivery)
    }

    if (dto.laborCost !== undefined || dto.partsCost !== undefined) {
      const currentLabor = dto.laborCost !== undefined ? new Prisma.Decimal(dto.laborCost) : order.laborCost ?? new Prisma.Decimal(0)
      const currentParts = dto.partsCost !== undefined ? new Prisma.Decimal(dto.partsCost) : order.partsCost ?? new Prisma.Decimal(0)
      data.totalCost = currentLabor.plus(currentParts)
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data,
      include: ORDER_INCLUDE,
    })

    this.logger.log(`OT ${updated.number} actualizada`)
    return updated
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    const allowed = VALID_TRANSITIONS[order.status]
    if (!allowed.includes(dto.status)) {
      throw new ConflictException(
        `No se puede cambiar de ${order.status} a ${dto.status}. ` +
        `Transiciones permitidas: ${allowed.length ? allowed.join(", ") : "ninguna"}`
      )
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: order.vehicleId },
      select: { plate: true },
    })

    const updateData: Prisma.WorkOrderUpdateInput = { status: dto.status }

    if (dto.status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date()
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: ORDER_INCLUDE,
      }),
      this.prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: dto.status,
          changedBy: userId,
        },
      }),
    ])

    this.wsGateway.broadcastOrderUpdate({
      orderId: id,
      orderNumber: order.number,
      newStatus: dto.status,
      vehiclePlate: vehicle?.plate ?? "",
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`OT ${updated.number}: ${order.status} → ${dto.status}`)
    return updated
  }

  async softDelete(id: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException("La orden ya esta cancelada")
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: ORDER_INCLUDE,
    })

    this.logger.log(`OT ${updated.number} cancelada (soft delete)`)
    return updated
  }

  async assignMechanic(id: string, mechanicId: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw new ConflictException("No se puede reasignar una orden finalizada o cancelada")
    }

    const updated = await this.prisma.workOrder.update({
      where: { id },
      data: { mechanicId },
      include: ORDER_INCLUDE,
    })

    this.logger.log(`OT ${updated.number} reasignada al mecanico ${mechanicId}`)
    return updated
  }

  async findByMechanic(mechanicId: string, filters: OrderFilterDto): Promise<PaginatedResult<unknown>> {
    return this.findAll({ ...filters, mechanicId })
  }

  async getSummaryStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      activeOrders,
      receivedToday,
      completedToday,
      deliveredToday,
      totalOrders,
      pendingPayment,
    ] = await Promise.all([
      this.prisma.workOrder.count({
        where: { status: { notIn: ["DELIVERED", "CANCELLED"] } },
      }),
      this.prisma.workOrder.count({
        where: { receivedAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.workOrder.count({
        where: { completedAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.workOrder.count({
        where: { deliveredAt: { gte: today, lt: tomorrow } },
      }),
      this.prisma.workOrder.count(),
      this.prisma.workOrder.count({
        where: {
          status: { in: ["READY", "IN_REVIEW"] },
          paymentStatus: { in: ["DRAFT", "ISSUED"] },
        },
      }),
    ])

    const todayRevenue = await this.prisma.financialTransaction.aggregate({
      where: {
        type: "PAYMENT",
        createdAt: { gte: today, lt: tomorrow },
      },
      _sum: { amount: true },
    })

    const lowStock = await this.prisma.inventoryItem.count({
      where: { stock: { lte: this.prisma.inventoryItem.fields.minStock } },
    })

    return {
      activeOrders,
      receivedToday,
      completedToday,
      deliveredToday,
      totalOrders,
      pendingPayment,
      todayRevenue: Number(todayRevenue._sum.amount ?? 0),
      lowStockCount: lowStock,
    }
  }

  async addItem(
    orderId: string,
    dto: { itemId: string; quantity: number; unitPrice: number },
    userId: string,
  ) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden no encontrada")

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new ConflictException("No se pueden modificar órdenes finalizadas")
    }

    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.itemId },
    })
    if (!item) throw new NotFoundException("Item de inventario no encontrado")

    if (item.stock < dto.quantity) {
      throw new ConflictException(
        `Stock insuficiente. Disponible: ${item.stock}, solicitado: ${dto.quantity}`,
      )
    }

    const [orderPart] = await this.prisma.$transaction([
      this.prisma.workOrderPart.create({
        data: {
          orderId,
          itemId: dto.itemId,
          quantity: dto.quantity,
          unitPrice: dto.unitPrice,
        },
      }),
      this.prisma.inventoryMovement.create({
        data: {
          itemId: dto.itemId,
          type: "OUT",
          quantity: dto.quantity,
          orderId,
          authorizedBy: userId,
          unitCost: item.unitPrice,
          justification: `Consumo en OT ${order.number}`,
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: { stock: item.stock - dto.quantity },
      }),
      this.prisma.workOrderEvent.create({
        data: {
          workOrderId: orderId,
          event: "PART_ADDED",
          description: `Repuesto ${item.name} x${dto.quantity} agregado`,
          userId,
        },
      }),
    ])

    this.logger.log(`Item ${item.sku} x${dto.quantity} agregado a OT ${order.number}`)
    return orderPart
  }
}
