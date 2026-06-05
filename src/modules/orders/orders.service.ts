import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { OrderStatus, Prisma, PaymentMethod, UserRole, ApprovalType, ApprovalStatus } from "@prisma/client"
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto, PaginatedResult, ApplyDiscountDto, RequestPartsDto, MechanicProgressDto } from "./dto/orders.dto"
import { RealtimeGateway } from "../../common/gateway/realtime.gateway"

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
    private readonly wsGateway: RealtimeGateway,
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
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
        createdBy: userId,
      },
      include: ORDER_INCLUDE,
    })

    this.wsGateway.emitOrderCreated({
      orderId: order.id,
      orderNumber: order.number,
      clientName: order.client.firstName,
      vehiclePlate: order.vehicle.plate,
    })

    this.logger.log(`OT ${number} creada`)
    return order
  }

  async findAll(filters: OrderFilterDto): Promise<PaginatedResult<unknown>> {
    const { status, mechanicId, from, to, limit = 20, cursor } = filters

    const where: Prisma.WorkOrderWhereInput = {}
    if (status) where.status = status
    if (mechanicId) where.mechanicId = mechanicId
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
        parts: { include: { item: true } },
        statusHistory: { orderBy: { timestamp: "desc" } },
        events: { orderBy: { createdAt: "desc" } },
        payments: { select: { id: true, method: true, amount: true, paidAt: true } },
      },
    })

    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    return order
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (dto.status && order.status === OrderStatus.CANCELLED) {
      throw new ConflictException("No se puede modificar una orden cancelada")
    }

    const data: Prisma.WorkOrderUpdateInput = {}
    if (dto.status !== undefined) data.status = dto.status
    if (dto.diagnosis !== undefined) data.diagnosis = dto.diagnosis
    if (dto.laborCost !== undefined) data.laborCost = new Prisma.Decimal(dto.laborCost)
    if (dto.partsCost !== undefined) data.partsCost = new Prisma.Decimal(dto.partsCost)
    if (dto.estimatedDelivery !== undefined) data.estimatedDelivery = new Date(dto.estimatedDelivery)

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
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    const allowed = VALID_TRANSITIONS[order.status]
    if (!allowed.includes(dto.status)) {
      throw new ConflictException(
        `No se puede cambiar de ${order.status} a ${dto.status}. ` +
        `Transiciones permitidas: ${allowed.length ? allowed.join(", ") : "ninguna"}`
      )
    }

    if (dto.status === OrderStatus.DELIVERED) {
      await this.validateVehicleDelivery(id)
    }

    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: order.vehicleId },
      select: { plate: true },
    })

    const updateData: Prisma.WorkOrderUpdateInput = { status: dto.status }
    if (dto.status === OrderStatus.DELIVERED) updateData.deliveredAt = new Date()

    const [updated] = await this.prisma.$transaction([
      this.prisma.workOrder.update({
        where: { id },
        data: updateData,
        include: ORDER_INCLUDE,
      }),
      this.prisma.orderStatusHistory.create({
        data: { orderId: id, status: dto.status, changedBy: userId },
      }),
    ])

    this.wsGateway.emitOrderStatusChanged({
      orderId: id,
      oldStatus: order.status,
      newStatus: dto.status,
      updatedBy: userId,
    })
    this.wsGateway.broadcastOrderUpdate({
      orderId: id,
      orderNumber: order.number,
      newStatus: dto.status,
      vehiclePlate: vehicle?.plate ?? "",
      changedById: userId,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`OT ${updated.number}: ${order.status} → ${dto.status}`)
    return updated
  }

  async validateVehicleDelivery(orderId: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: {
        parts: { include: { item: true } },
        payments: true,
      },
    })
    if (!order) throw new NotFoundException("Orden no encontrada para validacion de entrega")

    const laborCost = Number(order.laborCost ?? 0)
    const partsCost = order.parts.reduce((sum, p) => sum + Number(p.unitPrice) * p.quantity, 0)
    const totalRequired = laborCost + partsCost
    const totalPaid = order.payments.reduce((sum, p) => sum + Number(p.amount), 0)

    if (totalRequired <= 0) {
      throw new BadRequestException(
        "🔒 Operación cancelada: No se puede entregar un vehículo sin costos ni liquidación registrada en el sistema.",
      )
    }

    if (totalPaid < totalRequired) {
      const pending = totalRequired - totalPaid
      throw new BadRequestException(
        `No se puede entregar: existe un saldo pendiente de S/ ${pending.toFixed(2)}. Total requerido: S/ ${totalRequired.toFixed(2)}, Total pagado: S/ ${totalPaid.toFixed(2)}`,
      )
    }

    const suspiciousYape = order.payments.some(
      (p) => p.method === PaymentMethod.YAPE && Number(p.amount) >= 500,
    )
    if (suspiciousYape) {
      this.logger.warn(
        `OT ${order.number}: entrega con pago Yape >= S/500 - verificar manualmente`
      )
    }
  }

  async softDelete(id: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (order.status === OrderStatus.CANCELLED) throw new ConflictException("La orden ya esta cancelada")

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
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
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
    const { limit = 20, cursor } = filters
    const where: Prisma.WorkOrderWhereInput = { mechanicId }
    const take = limit + 1

    const orders = await this.prisma.workOrder.findMany({
      where,
      take,
      orderBy: { id: "asc" },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        ...ORDER_INCLUDE,
        parts: { include: { item: { select: { id: true, name: true, sku: true } } } },
        photosRel: { select: { id: true, url: true, type: true } },
        statusHistory: { orderBy: { timestamp: "desc" } },
        events: { orderBy: { createdAt: "desc" } },
      },
    })

    const hasMore = orders.length > limit
    const data = hasMore ? orders.slice(0, limit) : orders
    const nextCursor = hasMore ? data[data.length - 1].id : null

    const flattened = data.map((o) => ({
      ...o,
      vehiclePlate: o.vehicle?.plate ?? null,
      vehicleBrand: o.vehicle?.brand ?? null,
      vehicleModel: o.vehicle?.model ?? null,
      photos: (o as any).photosRel ?? [],
      timeline: [...((o as any).statusHistory ?? []), ...((o as any).events ?? []) as any[]].sort(
        (a: any, b: any) =>
          new Date(b.timestamp ?? b.createdAt ?? 0).getTime() -
          new Date(a.timestamp ?? a.createdAt ?? 0).getTime(),
      ),
    }))

    return { data: flattened, nextCursor }
  }

  async getSummaryStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      activeOrders, receivedToday, completedToday, deliveredToday,
      totalOrders, pendingPayment,
    ] = await Promise.all([
      this.prisma.workOrder.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED"] } } }),
      this.prisma.workOrder.count({ where: { receivedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.workOrder.count({ where: { completedAt: { gte: today, lt: tomorrow } } }),
      this.prisma.workOrder.count({ where: { deliveredAt: { gte: today, lt: tomorrow } } }),
      this.prisma.workOrder.count(),
      this.prisma.workOrder.count({
        where: { status: { in: ["READY", "IN_REVIEW"] }, paymentStatus: { in: ["DRAFT", "ISSUED"] } },
      }),
    ])

    const todayRevenue = await this.prisma.financialTransaction.aggregate({
      where: { type: "PAYMENT", createdAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    })

    const lowStock = await this.prisma.inventoryItem.count({
      where: { stock: { lte: this.prisma.inventoryItem.fields.minStock } },
    })

    return {
      activeOrders, receivedToday, completedToday, deliveredToday,
      totalOrders, pendingPayment,
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
      throw new ConflictException("No se pueden modificar ordenes finalizadas")
    }

    const item = await this.prisma.inventoryItem.findUnique({ where: { id: dto.itemId } })
    if (!item) throw new NotFoundException("Item de inventario no encontrado")
    if (item.stock < dto.quantity) {
      throw new ConflictException(`Stock insuficiente. Disponible: ${item.stock}, solicitado: ${dto.quantity}`)
    }

    const [orderPart] = await this.prisma.$transaction([
      this.prisma.workOrderPart.create({
        data: { orderId, itemId: dto.itemId, quantity: dto.quantity, unitPrice: dto.unitPrice },
      }),
      this.prisma.inventoryMovement.create({
        data: { itemId: dto.itemId, type: "OUT", quantity: dto.quantity, orderId, authorizedBy: userId, unitCost: item.unitPrice, justification: `Consumo en OT ${order.number}` },
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: { stock: item.stock - dto.quantity },
      }),
      this.prisma.workOrderEvent.create({
        data: { workOrderId: orderId, event: "PART_ADDED", description: `Repuesto ${item.name} x${dto.quantity} agregado`, userId },
      }),
    ])

    this.logger.log(`Item ${item.sku} x${dto.quantity} agregado a OT ${order.number}`)
    return orderPart
  }

  async applyDiscount(
    orderId: string,
    dto: ApplyDiscountDto,
    userId: string,
    userRole: UserRole,
  ) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden no encontrada")
    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new ConflictException("No se puede aplicar descuento a ordenes finalizadas")
    }

    const total = Number(order.totalCost ?? order.finalAmount ?? 0)
    const discountAmount = dto.discountAmount
      ?? (total * (dto.discountPercentage ?? 0) / 100)
    const discountPct = total > 0 ? (discountAmount / total) * 100 : 0

    if (discountPct > 20 && userRole !== UserRole.OWNER) {
      const approval = await this.prisma.approval.create({
        data: {
          type: ApprovalType.DISCOUNT,
          status: ApprovalStatus.PENDING,
          title: `Descuento ${discountPct.toFixed(1)}% en orden ${order.number}`,
          description: dto.reason,
          amount: discountAmount,
          requestedById: userId,
        },
      })

      this.wsGateway.emitApprovalRequested({
        approvalId: approval.id,
        type: "DISCOUNT",
        amount: discountAmount,
        requestedBy: userId,
      })

      return {
        status: "PENDING_APPROVAL",
        message: "Descuento > 20% requiere aprobacion de OWNER",
        approvalId: approval.id,
      }
    }

    const updated = await this.prisma.workOrder.update({
      where: { id: orderId },
      data: {
        discount: discountAmount,
        finalAmount: Math.max(0, total - discountAmount),
      },
    })

    this.logger.log(`Descuento ${discountPct.toFixed(1)}% aplicado a OT ${order.number}`)
    return updated
  }

  async uploadPhoto(orderId: string, photo: Express.Multer.File, description?: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    const url = `data:${photo.mimetype};base64,${photo.buffer.toString("base64")}`
    const hash = require("crypto").createHash("md5").update(photo.buffer).digest("hex")

    await this.prisma.workOrderPhoto.create({
      data: {
        orderId,
        url,
        type: photo.mimetype,
        hash,
      },
    })

    await this.prisma.workOrder.update({
      where: { id: orderId },
      data: { photos: { push: url } },
    })

    await this.prisma.workOrderEvent.create({
      data: {
        workOrderId: orderId,
        event: "PHOTO_UPLOADED",
        description: description
          ? `Foto cargada: ${description}`
          : "Foto del vehiculo cargada al sistema",
        userId: order.createdBy,
      },
    })

    this.logger.log(`Foto subida a OT ${order.number}`)
    return { success: true, url }
  }

  async requestParts(orderId: string, dto: RequestPartsDto, userId: string, userName: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")
    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      throw new ConflictException("No se pueden solicitar repuestos para una orden finalizada")
    }

    const results = await this.prisma.$transaction(async (tx) => {
      const created: unknown[] = []

      for (const req of dto.items) {
        const item = await tx.inventoryItem.findUnique({ where: { id: req.itemId } })
        if (!item) throw new NotFoundException(`Item de inventario no encontrado: ${req.itemId}`)
        if (item.stock < req.quantity) {
          throw new ConflictException(`Stock insuficiente para ${item.name}. Disponible: ${item.stock}, solicitado: ${req.quantity}`)
        }

        const part = await tx.workOrderPart.create({
          data: { orderId, itemId: req.itemId, quantity: req.quantity, unitPrice: item.unitPrice },
        })

        await tx.inventoryMovement.create({
          data: {
            itemId: req.itemId,
            type: "OUT",
            quantity: req.quantity,
            orderId,
            authorizedBy: userId,
            unitCost: item.costPrice,
            justification: `Consumo en OT ${order.number}`,
          },
        })

        await tx.inventoryItem.update({
          where: { id: req.itemId },
          data: { stock: item.stock - req.quantity },
        })

        await tx.workOrderEvent.create({
          data: {
            workOrderId: orderId,
            event: "PART_REQUESTED",
            description: `${userName} solicitó repuesto: ${item.name} x${req.quantity} para OT ${order.number}`,
            userId,
          },
        })

        created.push(part)
      }

      return created
    })

    this.logger.log(`${dto.items.length} repuesto(s) solicitado(s) para OT ${order.number}`)
    return { success: true, parts: results }
  }

  async reportProgress(orderId: string, dto: MechanicProgressDto, userId: string, userName: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    const desc = dto.notes
      ? `${userName} registró avance técnico: ${dto.notes} (${dto.progressPercent}%)`
      : `${userName} reportó avance del ${dto.progressPercent}% - ${dto.partsInstalled} repuestos instalados, ${dto.laborHours}h trabajadas`

    const event = await this.prisma.workOrderEvent.create({
      data: {
        workOrderId: orderId,
        event: "PROGRESS_REPORTED",
        description: desc,
        metadata: {
          progressPercent: dto.progressPercent,
          partsInstalled: dto.partsInstalled,
          laborHours: dto.laborHours,
          notes: dto.notes ?? null,
        },
        userId,
      },
    })

    if (dto.laborHours > 0) {
      await this.prisma.workOrder.update({
        where: { id: orderId },
        data: {
          laborCost: new Prisma.Decimal(
            Number(order.laborCost ?? 0) + dto.laborHours * 50,
          ),
        },
      })
    }

    this.logger.log(`Avance registrado en OT ${order.number}: ${dto.progressPercent}%`)
    return { success: true, event }
  }

  async deletePhoto(orderId: string, photoId: string, userId: string, userName: string) {
    const order = await this.prisma.workOrder.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException("Orden de trabajo no encontrada")

    const photo = await this.prisma.workOrderPhoto.findFirst({
      where: { id: photoId, orderId },
    })
    if (!photo) throw new NotFoundException("Foto no encontrada en esta orden")

    await this.prisma.workOrderPhoto.delete({ where: { id: photoId } })

    const updatedPhotos = (order.photos ?? []).filter((url: string) => url !== photo.url)
    await this.prisma.workOrder.update({
      where: { id: orderId },
      data: { photos: updatedPhotos },
    })

    await this.prisma.workOrderEvent.create({
      data: {
        workOrderId: orderId,
        event: "PHOTO_DELETED",
        description: `${userName} eliminó una foto del vehículo.`,
        userId,
      },
    })

    this.logger.log(`Foto ${photoId} eliminada de OT ${order.number}`)
    return { success: true }
  }

  async vehicleCheckin(
    body: { plate: string; brand: string; model: string; kilometerReading?: string; fuelLevel?: string; description?: string; photoPositions?: string },
    photos: Express.Multer.File[],
    userId: string,
    userName: string,
  ) {
    const plateNormalized = body.plate.toUpperCase().trim()

    let vehicle = await this.prisma.vehicle.findFirst({
      where: { plate: { equals: plateNormalized, mode: "insensitive" } },
    })

    if (vehicle) {
      const activeOrder = await this.prisma.workOrder.findFirst({
        where: {
          vehicleId: vehicle.id,
          status: { notIn: ["DELIVERED", "CANCELLED"] },
        },
      })
      if (activeOrder) {
        throw new ConflictException(`Ya existe una OT activa (${activeOrder.number}) para la placa ${plateNormalized}`)
      }
    }

    if (!vehicle) {
      let defaultClient = await this.prisma.client.findFirst({
        where: { email: "sinasignar@arellanhnos.com" },
      })
      if (!defaultClient) {
        defaultClient = await this.prisma.client.create({
          data: {
            firstName: "Cliente",
            lastName: "Sin Asignar",
            email: "sinasignar@arellanhnos.com",
            dni: "00000000",
            phone: "000000000",
          },
        })
      }

      vehicle = await this.prisma.vehicle.create({
        data: {
          plate: plateNormalized,
          brand: body.brand || "No especificado",
          model: body.model || "No especificado",
          year: new Date().getFullYear(),
          color: "No especificado",
          clientId: defaultClient.id,
        },
      })
    }

    const year = new Date().getFullYear()
    const count = await this.prisma.workOrder.count({
      where: { number: { startsWith: `OT-${year}-` } },
    })
    const number = `OT-${year}-${String(count + 1).padStart(4, "0")}`

    const order = await this.prisma.workOrder.create({
      data: {
        number,
        vehicleId: vehicle.id,
        clientId: vehicle.clientId,
        mechanicId: userId,
        description: body.description || `Ingreso de vehículo ${plateNormalized}`,
        createdBy: userId,
      },
      include: ORDER_INCLUDE,
    })

    for (const photo of photos) {
      const url = `data:${photo.mimetype};base64,${photo.buffer.toString("base64")}`
      const hash = require("crypto").createHash("md5").update(photo.buffer).digest("hex")
      await this.prisma.workOrderPhoto.create({
        data: { orderId: order.id, url, type: photo.mimetype, hash },
      })
      await this.prisma.workOrder.update({
        where: { id: order.id },
        data: { photos: { push: url } },
      })
    }

    await this.prisma.workOrderEvent.create({
      data: {
        workOrderId: order.id,
        event: "VEHICLE_INTAKE",
        description: `${userName} ingresó el vehículo ${plateNormalized} al taller`,
        userId,
      },
    })

    this.wsGateway.emitOrderCreated({
      orderId: order.id,
      orderNumber: order.number,
      clientName: vehicle.brand + " " + vehicle.model,
      vehiclePlate: vehicle.plate,
    })

    this.logger.log(`Checkin: Vehículo ${plateNormalized} → OT ${order.number}`)
    return { success: true, orderId: order.id, orderNumber: order.number }
  }
}
