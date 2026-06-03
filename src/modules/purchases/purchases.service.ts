import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma, PurchaseStatus, MovementType } from "@prisma/client"
import {
  PurchaseFilterDto,
  CreatePurchaseDto,
  UpdatePurchaseStatusDto,
  ReceiveItemDto,
  ReceiveItemsDto,
} from "./dto/purchases.dto"

const VALID_TRANSITIONS: Record<PurchaseStatus, PurchaseStatus[]> = {
  DRAFT: [PurchaseStatus.SENT, PurchaseStatus.CANCELLED],
  SENT: [PurchaseStatus.CONFIRMED, PurchaseStatus.CANCELLED],
  CONFIRMED: [PurchaseStatus.PARTIALLY_RECEIVED, PurchaseStatus.RECEIVED, PurchaseStatus.CANCELLED],
  PARTIALLY_RECEIVED: [PurchaseStatus.RECEIVED, PurchaseStatus.CANCELLED],
  RECEIVED: [],
  CANCELLED: [],
}

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: PurchaseFilterDto) {
    const { status, supplierId, search, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.PurchaseWhereInput = {}
    if (status) where.status = status
    if (supplierId) where.supplierId = supplierId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          supplier: { select: { id: true, name: true, contactName: true, phone: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.purchase.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            item: {
              select: { id: true, sku: true, name: true, stock: true },
            },
          },
        },
        commissions: {
          include: {
            personnel: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    })

    if (!purchase) {
      throw new NotFoundException("Compra no encontrada")
    }

    return purchase
  }

  async create(dto: CreatePurchaseDto, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    })
    if (!supplier) {
      throw new NotFoundException("Proveedor no encontrado")
    }

    const year = new Date().getFullYear()
    const count = await this.prisma.purchase.count({
      where: { number: { startsWith: `OC-${year}-` } },
    })
    const number = `OC-${year}-${String(count + 1).padStart(4, "0")}`

    let subtotal = 0
    for (const item of dto.items) {
      const inventoryItem = await this.prisma.inventoryItem.findUnique({
        where: { id: item.itemId },
      })
      if (!inventoryItem) {
        throw new NotFoundException(`Item de inventario no encontrado: ${item.itemId}`)
      }
      subtotal += item.quantity * item.unitCost
    }

    const tax = dto.tax ?? 0
    const shipping = dto.shipping ?? 0
    const customs = dto.customs ?? 0
    const total = subtotal + tax + shipping + customs

    const purchase = await this.prisma.purchase.create({
      data: {
        number,
        supplierId: dto.supplierId,
        status: PurchaseStatus.DRAFT,
        subtotal,
        tax,
        shipping,
        customs,
        total,
        currency: dto.currency ?? "PEN",
        isImported: dto.isImported ?? supplier.isImporter,
        notes: dto.notes,
        expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
        commissionAmount: dto.commissionAmount,
        commissionTo: dto.commissionTo,
        createdBy: userId,
        items: {
          create: dto.items.map((i) => ({
            itemId: i.itemId,
            quantity: i.quantity,
            unitCost: i.unitCost,
            totalCost: i.quantity * i.unitCost,
            notes: i.notes,
          })),
        },
      },
      include: {
        supplier: { select: { id: true, name: true } },
        items: { include: { item: { select: { id: true, sku: true, name: true } } } },
      },
    })

    this.logger.log(`Compra creada: ${number} - ${supplier.name}`)
    return purchase
  }

  async updateStatus(id: string, status: PurchaseStatus, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id } })
    if (!purchase) {
      throw new NotFoundException("Compra no encontrada")
    }

    const allowed = VALID_TRANSITIONS[purchase.status]
    if (!allowed.includes(status)) {
      throw new ConflictException(
        `No se puede cambiar de ${purchase.status} a ${status}. ` +
        `Transiciones permitidas: ${allowed.length ? allowed.join(", ") : "ninguna"}`,
      )
    }

    const updateData: Prisma.PurchaseUpdateInput = { status }

    if (status === PurchaseStatus.SENT) {
      updateData.orderedAt = new Date()
    } else if (status === PurchaseStatus.RECEIVED) {
      updateData.receivedAt = new Date()
    }

    const updated = await this.prisma.purchase.update({
      where: { id },
      data: updateData,
      include: {
        supplier: { select: { id: true, name: true } },
        items: true,
      },
    })

    this.logger.log(`Compra ${updated.number}: ${purchase.status} -> ${status}`)
    return updated
  }

  async receiveItems(id: string, dto: ReceiveItemsDto, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: { items: { include: { item: true } } },
    })
    if (!purchase) {
      throw new NotFoundException("Compra no encontrada")
    }

    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new ConflictException("No se pueden recibir items de una compra cancelada")
    }

    if (![PurchaseStatus.CONFIRMED, PurchaseStatus.SENT, PurchaseStatus.PARTIALLY_RECEIVED].includes(purchase.status)) {
      throw new ConflictException("La compra debe estar en estado CONFIRMED, SENT o PARTIALLY_RECEIVED")
    }

    await this.prisma.$transaction(async (tx) => {
      for (const { itemId, qty } of dto.items) {
        const purchaseItem = purchase.items.find((pi) => pi.id === itemId)
        if (!purchaseItem) {
          throw new NotFoundException(`Item de compra no encontrado: ${itemId}`)
        }

        if (purchaseItem.receivedQty + qty > purchaseItem.quantity) {
          throw new ConflictException(
            `Cantidad recibida excede la ordenada para ${purchaseItem.item?.name ?? itemId}. ` +
            `Recibido: ${purchaseItem.receivedQty}, ordenado: ${purchaseItem.quantity}, intentando recibir: ${qty}`,
          )
        }

        await tx.purchaseItem.update({
          where: { id: itemId },
          data: { receivedQty: purchaseItem.receivedQty + qty },
        })

        await tx.inventoryItem.update({
          where: { id: purchaseItem.itemId },
          data: { stock: { increment: qty } },
        })

        await tx.inventoryMovement.create({
          data: {
            itemId: purchaseItem.itemId,
            type: MovementType.IN,
            quantity: qty,
            authorizedBy: userId,
            unitCost: purchaseItem.unitCost,
            justification: `Recepcion de compra ${purchase.number}`,
          },
        })
      }
    })

    const updated = await this.prisma.purchase.findUnique({
      where: { id },
      include: { items: { include: { item: { select: { id: true, sku: true, name: true, stock: true } } } } },
    })

    const allReceived = updated!.items.every((i) => i.receivedQty >= i.quantity)
    const someReceived = updated!.items.some((i) => i.receivedQty > 0)

    if (allReceived) {
      await this.prisma.purchase.update({
        where: { id },
        data: { status: PurchaseStatus.RECEIVED, receivedAt: new Date() },
      })
    } else if (someReceived) {
      await this.prisma.purchase.update({
        where: { id },
        data: { status: PurchaseStatus.PARTIALLY_RECEIVED },
      })
    }

    this.logger.log(`Items recibidos para compra ${purchase.number}`)
    return updated
  }

  async getBySupplier(supplierId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: supplierId },
    })
    if (!supplier) {
      throw new NotFoundException("Proveedor no encontrado")
    }

    return this.prisma.purchase.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    })
  }

  async getImports() {
    return this.prisma.purchase.findMany({
      where: { isImported: true },
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    })
  }
}
