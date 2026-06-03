import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma, InvoiceStatus, InvoiceType, OrderStatus } from "@prisma/client"
import { InvoiceFilterDto, CreateInvoiceDto } from "./dto/invoices.dto"

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: InvoiceFilterDto) {
    const { status, clientId, search, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.InvoiceWhereInput = {}
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
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
          workOrder: { select: { id: true, number: true } },
          _count: { select: { payments: true } },
        },
      }),
      this.prisma.invoice.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        workOrder: {
          include: {
            vehicle: true,
            items: { include: { item: { select: { id: true, sku: true, name: true } } } },
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
        },
      },
    })

    if (!invoice) {
      throw new NotFoundException("Factura no encontrada")
    }

    return invoice
  }

  async createFromOrder(orderId: string, userId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: { items: true, client: true },
    })
    if (!workOrder) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { workOrderId: orderId },
    })
    if (existingInvoice) {
      throw new ConflictException(`Ya existe una factura (${existingInvoice.number}) para esta orden`)
    }

    const year = new Date().getFullYear()
    const count = await this.prisma.invoice.count({
      where: { number: { startsWith: `INV-${year}-` } },
    })
    const number = `INV-${year}-${String(count + 1).padStart(4, "0")}`

    const subtotal = Number(workOrder.totalCost ?? 0)
    const discount = Number(workOrder.discount ?? 0)
    const tax = (subtotal - discount) * 0.18
    const total = subtotal - discount + tax

    const invoice = await this.prisma.invoice.create({
      data: {
        number,
        workOrderId: orderId,
        clientId: workOrder.clientId,
        type: InvoiceType.BOLETA,
        status: InvoiceStatus.DRAFT,
        subtotal,
        tax,
        discount,
        total,
        dueAmount: total,
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
        workOrder: { select: { id: true, number: true } },
      },
    })

    await this.prisma.workOrder.update({
      where: { id: orderId },
      data: { paymentStatus: InvoiceStatus.DRAFT },
    })

    this.logger.log(`Factura creada: ${number} desde OT ${workOrder.number}`)
    return invoice
  }

  async issue(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } })
    if (!invoice) {
      throw new NotFoundException("Factura no encontrada")
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new ConflictException("Solo se pueden emitir facturas en estado DRAFT")
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.ISSUED,
          issuedAt: new Date(),
          dueDate: invoice.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      if (invoice.workOrderId) {
        await tx.workOrder.update({
          where: { id: invoice.workOrderId },
          data: { paymentStatus: InvoiceStatus.ISSUED },
        })
      }

      return inv
    })

    this.logger.log(`Factura emitida: ${updated.number}`)
    return updated
  }

  async cancel(id: string, reason: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } })
    if (!invoice) {
      throw new NotFoundException("Factura no encontrada")
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new ConflictException("La factura ya esta cancelada")
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new ConflictException("No se puede cancelar una factura ya pagada")
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason,
      },
    })

    this.logger.log(`Factura cancelada: ${updated.number}`)
    return updated
  }

  async getByClient(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    })
    if (!client) {
      throw new NotFoundException("Cliente no encontrado")
    }

    return this.prisma.invoice.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        workOrder: { select: { id: true, number: true } },
        _count: { select: { payments: true } },
      },
    })
  }

  async getOverdue() {
    const now = new Date()

    return this.prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.OVERDUE,
        dueDate: { lt: now },
        dueAmount: { gt: 0 },
      },
      orderBy: { dueDate: "asc" },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
        workOrder: { select: { id: true, number: true } },
      },
    })
  }
}
