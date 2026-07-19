import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma, QuoteStatus, OrderStatus } from "@prisma/client"
import { QuoteFilterDto, CreateQuoteDto } from "./dto/quotes.dto"

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: QuoteFilterDto) {
    const { status, clientId, search, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.QuoteWhereInput = {}
    if (status) where.status = status
    if (clientId) where.clientId = clientId
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
      this.prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
          workOrder: { select: { id: true, number: true, status: true } },
        },
      }),
      this.prisma.quote.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: true,
        workOrder: {
          include: {
            vehicle: true,
            items: {
              include: { item: { select: { id: true, sku: true, name: true } } },
            },
          },
        },
      },
    })

    if (!quote) {
      throw new NotFoundException("Cotizacion no encontrada")
    }

    return quote
  }

  async create(dto: CreateQuoteDto, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    })
    if (!client) {
      throw new NotFoundException("Cliente no encontrado")
    }

    if (!dto.workOrderId) {
      throw new BadRequestException("Se requiere una orden de trabajo para crear una cotizacion")
    }

    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: dto.workOrderId },
      include: { items: true },
    })
    if (!workOrder) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    const year = new Date().getFullYear()
    const count = await this.prisma.quote.count({
      where: { number: { startsWith: `COT-${year}-` } },
    })
    const number = `COT-${year}-${String(count + 1).padStart(4, "0")}`

    const itemsTotal = workOrder.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    )
    const subtotal = itemsTotal
    const tax = subtotal * 0.18
    const total = subtotal + tax

    const quote = await this.prisma.quote.create({
      data: {
        number,
        clientId: dto.clientId,
        workOrderId: dto.workOrderId,
        status: QuoteStatus.DRAFT,
        validUntil: new Date(dto.validUntil),
        subtotal,
        tax,
        total,
        notes: dto.notes,
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
        workOrder: { select: { id: true, number: true } },
      },
    })

    this.logger.log(`Cotizacion creada: ${number}`)
    return quote
  }

  async approve(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
    })
    if (!quote) {
      throw new NotFoundException("Cotizacion no encontrada")
    }

    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SENT) {
      throw new ConflictException("Solo se pueden aprobar cotizaciones en estado DRAFT o SENT")
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const q = await tx.quote.update({
        where: { id },
        data: {
          status: QuoteStatus.APPROVED,
          approvedAt: new Date(),
        },
      })

      if (quote.workOrderId) {
        await tx.workOrder.update({
          where: { id: quote.workOrderId },
          data: { status: OrderStatus.BUDGETED },
        })

        await tx.orderStatusHistory.create({
          data: {
            orderId: quote.workOrderId,
            status: OrderStatus.BUDGETED,
            changedBy: quote.createdBy,
          },
        })
      }

      return q
    })

    this.logger.log(`Cotizacion aprobada: ${updated.number}`)
    return updated
  }

  async reject(id: string, reason: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id } })
    if (!quote) {
      throw new NotFoundException("Cotizacion no encontrada")
    }

    if (quote.status === QuoteStatus.APPROVED || quote.status === QuoteStatus.CONVERTED) {
      throw new ConflictException("No se puede rechazar una cotizacion aprobada o convertida")
    }

    const updated = await this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.REJECTED,
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
    })

    this.logger.log(`Cotizacion rechazada: ${updated.number}`)
    return updated
  }

  async convertToOrder(id: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { workOrder: { include: { items: true } } },
    })
    if (!quote) {
      throw new NotFoundException("Cotizacion no encontrada")
    }

    if (quote.status !== QuoteStatus.APPROVED) {
      throw new ConflictException("Solo se pueden convertir cotizaciones aprobadas")
    }

    if (!quote.workOrderId || !quote.workOrder) {
      throw new BadRequestException("La cotizacion no tiene una orden de trabajo asociada")
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const q = await tx.quote.update({
        where: { id },
        data: { status: QuoteStatus.CONVERTED },
      })

      await tx.workOrder.update({
        where: { id: quote.workOrderId! },
        data: {
          status: OrderStatus.IN_PROGRESS,
          startedAt: new Date(),
          totalCost: quote.total,
          finalAmount: quote.total,
        },
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId: quote.workOrderId!,
          status: OrderStatus.IN_PROGRESS,
          changedBy: userId,
        },
      })

      return q
    })

    this.logger.log(`Cotizacion convertida a orden: ${updated.number}`)
    return updated
  }
}
