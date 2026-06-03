import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
import { Prisma, InvoiceStatus, PaymentMethod, PaymentChannel } from "@prisma/client"
import { PaymentFilterDto, CreatePaymentDto } from "./dto/payments.dto"

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: PaymentFilterDto) {
    const { method, invoiceId, orderId, search, from, to, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.PaymentWhereInput = {}
    if (method) where.method = method
    if (invoiceId) where.invoiceId = invoiceId
    if (orderId) where.workOrderId = orderId
    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          invoice: { select: { id: true, number: true, client: { select: { id: true, firstName: true, lastName: true } } } },
          workOrder: { select: { id: true, number: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async create(dto: CreatePaymentDto, userId: string) {
    if (!dto.invoiceId && !dto.workOrderId) {
      throw new BadRequestException("Debe especificar una factura o una orden de trabajo")
    }

    if (dto.method === PaymentMethod.CASH && !dto.invoiceId) {
      throw new BadRequestException("Los pagos en efectivo requieren una factura asociada")
    }

    if (dto.method === PaymentMethod.CARD && !dto.receiptUrl) {
      throw new BadRequestException("Los pagos con tarjeta requieren comprobante (receiptUrl)")
    }

    if (dto.isPersonalYape && !dto.yapeAccount) {
      throw new BadRequestException("Debe especificar la cuenta Yape (yapeAccount)")
    }

    // ANTI-FRAUDE: Validación de Yape oficial del taller
    if (dto.method === PaymentMethod.YAPE) {
      const officialSetting = await this.prisma.setting.findUnique({
        where: { key: "TALLER_YAPE_NUMBER" },
      })
      const officialYape = officialSetting?.value || null

      if (dto.yapeAccount && officialYape && dto.yapeAccount !== officialYape) {
        this.logger.warn(
          `ALERTA SEGURIDAD: Pago recibido en Yape personal: ${dto.yapeAccount}. ` +
          `Yape oficial: ${officialYape}. Orden: ${dto.workOrderId ?? "N/A"}`
        )

        await this.prisma.auditLog.create({
          data: {
            userId: userId,
            userName: "system",
            role: "SYSTEM",
            action: "PAYMENT_UNAUTHORIZED_YAPE",
            entity: "Payment",
            entityId: null,
            severity: "SECURITY_ALERT",
            ipAddress: "internal",
            metadata: {
              yapeAccount: dto.yapeAccount,
              officialYape,
              workOrderId: dto.workOrderId,
              amount: Number(dto.amount),
              receivedBy: userId,
            } as any,
          },
        })

        await this.prisma.notification.create({
          data: {
            userId: userId,
            type: "SECURITY_ALERT",
            title: "Pago en Yape no autorizado",
            body: `Se recibió un pago de S/ ${Number(dto.amount).toFixed(2)} en Yape ${dto.yapeAccount}. ` +
                  `El Yape oficial del taller es ${officialYape}.`,
            priority: "HIGH",
            channel: "IN_APP",
            data: {
              yapeAccount: dto.yapeAccount,
              officialYape,
              workOrderId: dto.workOrderId,
            } as any,
          },
        })

        dto.isPersonalYape = true
      }
    }

    if (dto.invoiceId) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: dto.invoiceId },
      })
      if (!invoice) {
        throw new NotFoundException("Factura no encontrada")
      }
    }

    if (dto.workOrderId) {
      const order = await this.prisma.workOrder.findUnique({
        where: { id: dto.workOrderId },
      })
      if (!order) {
        throw new NotFoundException("Orden de trabajo no encontrada")
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        workOrderId: dto.workOrderId,
        method: dto.method,
        amount: dto.amount,
        reference: dto.reference,
        receivedBy: userId,
        channel: dto.channel ?? PaymentChannel.IN_PERSON,
        isPersonalYape: dto.isPersonalYape ?? false,
        yapeAccount: dto.yapeAccount,
        notes: dto.notes,
        receiptUrl: dto.receiptUrl,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
      include: {
        invoice: { select: { id: true, number: true } },
        workOrder: { select: { id: true, number: true } },
      },
    })

    if (dto.invoiceId) {
      await this.updateInvoicePaymentStatus(dto.invoiceId)
    }

    this.logger.log(`Pago registrado: ${payment.id}, monto: ${payment.amount}, metodo: ${payment.method}`)
    return payment
  }

  async verify(id: string, verifierId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id } })
    if (!payment) {
      throw new NotFoundException("Pago no encontrado")
    }

    if (payment.verifiedBy) {
      throw new ConflictException("Este pago ya fue verificado")
    }

    const verifier = await this.prisma.account.findUnique({
      where: { id: verifierId },
    })
    if (!verifier) {
      throw new NotFoundException("Verificador no encontrado")
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { verifiedBy: verifierId },
    })

    this.logger.log(`Pago verificado: ${id} por ${verifierId}`)
    return updated
  }

  async getByOrder(orderId: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
    })
    if (!order) {
      throw new NotFoundException("Orden de trabajo no encontrada")
    }

    return this.prisma.payment.findMany({
      where: { workOrderId: orderId },
      orderBy: { createdAt: "desc" },
      include: {
        invoice: { select: { id: true, number: true } },
      },
    })
  }

  async getByMethod(method: PaymentMethod, from: string, to: string) {
    return this.prisma.payment.findMany({
      where: {
        method,
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        invoice: { select: { id: true, number: true, client: { select: { id: true, firstName: true, lastName: true } } } },
        workOrder: { select: { id: true, number: true } },
      },
    })
  }

  async getTodaySummary() {
    const today = new Date()
    const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const payments = await this.prisma.payment.findMany({
      where: {
        createdAt: { gte: startToday, lte: endToday },
      },
      select: {
        method: true,
        amount: true,
      },
    })

    const summary: Record<string, { count: number; total: number }> = {}

    for (const p of payments) {
      if (!summary[p.method]) {
        summary[p.method] = { count: 0, total: 0 }
      }
      summary[p.method].count++
      summary[p.method].total += Number(p.amount)
    }

    const grandTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      date: startToday.toISOString().split("T")[0],
      totalPayments: payments.length,
      grandTotal,
      byMethod: summary,
    }
  }

  private async updateInvoicePaymentStatus(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    })
    if (!invoice) return

    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    )
    const totalAmount = Number(invoice.total)
    const dueAmount = totalAmount - totalPaid

    let status: InvoiceStatus = InvoiceStatus.ISSUED
    if (totalPaid >= totalAmount) {
      status = InvoiceStatus.PAID
    } else if (totalPaid > 0) {
      status = InvoiceStatus.PARTIALLY_PAID
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status,
        paidAmount: totalPaid,
        dueAmount: dueAmount > 0 ? dueAmount : 0,
        paidAt: status === InvoiceStatus.PAID ? new Date() : invoice.paidAt,
      },
    })

    if (invoice.workOrderId) {
      await this.prisma.workOrder.update({
        where: { id: invoice.workOrderId },
        data: { paymentStatus: status },
      })
    }
  }
}
