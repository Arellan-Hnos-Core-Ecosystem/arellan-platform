import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import { InjectQueue } from "@nestjs/bullmq"
import { Queue } from "bullmq"
import * as crypto from "crypto"
import { PrismaService } from "../../common/prisma/prisma.service"
import { RedisService } from "../../common/redis/redis.service"
import { RealtimeGateway } from "../../common/gateway/realtime.gateway"
import { QueueName } from "../../queues/queue-names.enum"
import {
  OpenCashboxDto,
  CloseCashboxDto,
  CreateTransactionDto,
  CreateExpenseDto,
  ApproveExpenseDto,
  ExpenseFiltersDto,
} from "./dto/finance.dto"
import {
  CashboxSession,
  FinancialTransaction,
  ExpenseAuthorization,
  TransactionType,
  ApprovalLevel,
  ExpenseStatus,
  Prisma,
  UserRole,
} from "@prisma/client"

const SUSPICIOUS_EXPENSE_THRESHOLD = 200
const SUSPICIOUS_CATEGORIES = ["SERVICES", "OTHER"]

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly realtimeGateway: RealtimeGateway,
    @InjectQueue(QueueName.ALERT_DISPATCHER) private readonly alertQueue: Queue,
  ) {}

  async openCashbox(userId: string, dto: OpenCashboxDto) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existing = await this.prisma.cashboxSession.findFirst({
      where: { openedAt: { gte: todayStart, lte: todayEnd }, status: "OPEN" },
    })
    if (existing) throw new ConflictException("Ya existe una caja abierta hoy")

    const session = await this.prisma.cashboxSession.create({
      data: { openedById: userId, openingBalance: dto.openingBalance, status: "OPEN" },
      include: { openedBy: { select: { id: true, name: true, role: true } } },
    })

    this.logger.log(`Caja abierta por ${userId} con saldo inicial ${dto.openingBalance}`)
    return session
  }

  async closeCashbox(userId: string, dto: CloseCashboxDto) {
    const session = await this.prisma.cashboxSession.findFirst({
      where: { status: "OPEN" },
      include: { transactions: true },
    })
    if (!session) throw new NotFoundException("No hay una caja abierta para cerrar")

    const paymentSum = session.transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expenseSum = session.transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expected = Number(session.openingBalance) + paymentSum - expenseSum
    const discrepancy = dto.actualCash - expected

    if (Math.abs(discrepancy) > 50) {
      this.logger.error(`POSIBLE FRAUDE: Discrepancia de caja ${discrepancy.toFixed(2)} en sesion ${session.id}`)
      await this.alertQueue.add("cashbox-discrepancy", {
        type: "CASHBOX_DISCREPANCY",
        sessionId: session.id,
        userId,
        discrepancy: discrepancy.toFixed(2),
        expected: expected.toFixed(2),
        actual: dto.actualCash.toFixed(2),
        timestamp: new Date().toISOString(),
      })
    } else if (Math.abs(discrepancy) > 10) {
      this.logger.warn(`Discrepancia de caja ${discrepancy.toFixed(2)} en sesion ${session.id}`)
    }

    const closed = await this.prisma.cashboxSession.update({
      where: { id: session.id },
      data: {
        status: "CLOSED",
        closedById: userId,
        actualCash: dto.actualCash,
        closingBalance: expected,
        discrepancy,
        notes: dto.notes || null,
        closedAt: new Date(),
      },
      include: {
        closedBy: { select: { id: true, name: true, role: true } },
        transactions: true,
      },
    })

    this.logger.log(`Caja ${session.id} cerrada por ${userId}`)
    return closed
  }

  async getTodaySession() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const session = await this.prisma.cashboxSession.findFirst({
      where: { openedAt: { gte: todayStart, lte: todayEnd }, status: "OPEN" },
      include: {
        transactions: { orderBy: { createdAt: "desc" } },
        openedBy: { select: { id: true, name: true, role: true } },
      },
    })

    if (!session) return { open: false, message: "No hay caja abierta hoy" }
    return { open: true, session }
  }

  async addTransaction(sessionId: string, dto: CreateTransactionDto) {
    const session = await this.prisma.cashboxSession.findUnique({ where: { id: sessionId } })
    if (!session) throw new NotFoundException("Sesion de caja no encontrada")
    if (session.status !== "OPEN") throw new ConflictException("La caja no esta abierta")

    const transaction = await this.prisma.financialTransaction.create({
      data: {
        sessionId,
        type: dto.type,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        orderId: dto.orderId || null,
        description: dto.description || null,
      },
    })

    this.logger.log(`Transaccion ${transaction.id} (${dto.type}) agregada a sesion ${sessionId}`)
    return transaction
  }

  async createExpense(requesterId: string, dto: CreateExpenseDto) {
    const approvalLevel = this.determineApprovalLevel(dto.amount)

    // Auto-approve expenses under S/ 100
    const status: ExpenseStatus = Number(dto.amount) < 100
      ? ExpenseStatus.DISBURSED
      : ExpenseStatus.PENDING_APPROVAL

    const expense = await this.prisma.expenseAuthorization.create({
      data: {
        requesterId,
        amount: dto.amount,
        currency: dto.currency || "PEN",
        category: dto.category,
        description: dto.description,
        invoiceUrl: dto.invoiceUrl || null,
        status,
        approvalLevel,
        ...(status === ExpenseStatus.DISBURSED ? { 
          approverId: requesterId,
          approvedAt: new Date(),
          disbursedAt: new Date() 
        } : {}),
      },
      include: {
        requester: { select: { id: true, name: true, role: true } },
      },
    })

    if (status === ExpenseStatus.DISBURSED) {
      this.logger.log(`Gasto ${expense.id} S/ ${dto.amount} auto-aprobado (menor a S/ 100)`)
      return expense
    }

    const isSuspicious =
      Number(dto.amount) >= SUSPICIOUS_EXPENSE_THRESHOLD ||
      SUSPICIOUS_CATEGORIES.includes(dto.category)

    if (isSuspicious) {
      await this.alertQueue.add("suspicious-expense", {
        type: "SUSPICIOUS_EXPENSE",
        expenseId: expense.id,
        requesterId,
        amount: Number(dto.amount),
        category: dto.category,
        approvalLevel,
        timestamp: new Date().toISOString(),
      })
    }

    await this.alertQueue.add("expense-approval-required", {
      type: "EXPENSE_APPROVAL_REQUIRED",
      expenseId: expense.id,
      requesterId,
      amount: Number(dto.amount),
      description: dto.description,
      approvalLevel,
      timestamp: new Date().toISOString(),
    })

    this.logger.log(`Gasto ${expense.id} creado por ${requesterId} nivel ${approvalLevel} monto ${dto.amount}`)
    return expense
  }

  async approveExpense(expenseId: string, approverId: string, dto: ApproveExpenseDto) {
    const expense = await this.prisma.expenseAuthorization.findUnique({ where: { id: expenseId } })
    if (!expense) throw new NotFoundException("Gasto no encontrado")
    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) throw new ConflictException("El gasto ya fue procesado")
    if (expense.requesterId === approverId) {
      throw new ForbiddenException({ message: "No puedes aprobar tus propios gastos", code: "SELF_APPROVAL_FORBIDDEN" })
    }

    const approver = await this.prisma.account.findUnique({
      where: { id: approverId },
      select: { id: true, role: true, name: true },
    })
    if (!approver) throw new NotFoundException("Aprobador no encontrado")

    if (!this.canApproveLevel(approver.role, expense.approvalLevel)) {
      throw new ForbiddenException({
        message: `Tu rol no tiene nivel suficiente para aprobar este gasto (requiere ${expense.approvalLevel})`,
        code: "INSUFFICIENT_APPROVAL_LEVEL",
      })
    }

    if (dto.decision === "REJECTED") {
      const rejected = await this.prisma.expenseAuthorization.update({
        where: { id: expenseId },
        data: { status: ExpenseStatus.REJECTED, approverId, rejectionReason: dto.rejectionReason, approvedAt: new Date() },
        include: {
          requester: { select: { id: true, name: true, role: true } },
          approver: { select: { id: true, name: true, role: true } },
        },
      })
      this.logger.log(`Gasto ${expenseId} RECHAZADO por ${approverId}`)
      return rejected
    }

    const approved = await this.prisma.expenseAuthorization.update({
      where: { id: expenseId },
      data: {
        status: ExpenseStatus.DISBURSED,
        approverId,
        approvedAt: new Date(),
        disbursedAt: new Date(),
        rejectionReason: null,
      },
      include: {
        requester: { select: { id: true, name: true, role: true } },
        approver: { select: { id: true, name: true, role: true } },
      },
    })

    this.logger.log(`Gasto ${expenseId} APROBADO por ${approverId} (nivel ${expense.approvalLevel})`)
    return approved
  }

  async getPendingExpenses(approverId?: string) {
    const where: Prisma.ExpenseAuthorizationWhereInput = { status: ExpenseStatus.PENDING_APPROVAL }
    if (approverId) where.requesterId = { not: approverId }

    return this.prisma.expenseAuthorization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { requester: { select: { id: true, name: true, role: true } } },
    })
  }

  async getExpenses(filters: ExpenseFiltersDto) {
    const where: Prisma.ExpenseAuthorizationWhereInput = {}
    if (filters.status) where.status = filters.status as ExpenseStatus
    if (filters.category) where.category = filters.category as any
    if (filters.requesterId) where.requesterId = filters.requesterId
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate)
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate)
    }

    const page = filters.page || 1
    const size = filters.size || 20
    const skip = (page - 1) * size

    const [data, total] = await Promise.all([
      this.prisma.expenseAuthorization.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: size,
        include: {
          requester: { select: { id: true, name: true, role: true } },
          approver: { select: { id: true, name: true, role: true } },
        },
      }),
      this.prisma.expenseAuthorization.count({ where }),
    ])

    return { data, total, page, size, totalPages: Math.ceil(total / size) }
  }

  async getCashboxHistory(limit?: number, cursor?: string) {
    const take = limit && limit > 0 && limit <= 100 ? limit : 20
    const sessions = await this.prisma.cashboxSession.findMany({
      where: { status: "CLOSED" },
      orderBy: { closedAt: "desc" },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        openedBy: { select: { id: true, name: true, role: true } },
        closedBy: { select: { id: true, name: true, role: true } },
        transactions: true,
      },
    })

    let nextCursor: string | null = null
    if (sessions.length > take) {
      const nextItem = sessions.pop()
      nextCursor = nextItem!.id
    }

    return { data: sessions, nextCursor }
  }

  async getCommissions(query: {
    status?: string
    personnelId?: string
    page: number
    limit: number
  }) {
    const where: any = {}
    if (query.status) where.status = query.status
    if (query.personnelId) where.personnelId = query.personnelId

    const [data, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        include: {
          personnel: { select: { firstName: true, lastName: true } },
          supplier: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.commission.count({ where }),
    ])

    return {
      data,
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    }
  }

  private determineApprovalLevel(amount: number): ApprovalLevel {
    if (amount <= 100) return ApprovalLevel.FINANCE
    if (amount <= 500) return ApprovalLevel.ADMIN
    if (amount <= 2000) return ApprovalLevel.OWNER
    return ApprovalLevel.DUAL_OWNER
  }

  private canApproveLevel(role: UserRole, level: ApprovalLevel): boolean {
    const roleHierarchy: Record<ApprovalLevel, UserRole[]> = {
      [ApprovalLevel.FINANCE]: [UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER],
      [ApprovalLevel.ADMIN]: [UserRole.ADMIN, UserRole.OWNER],
      [ApprovalLevel.OWNER]: [UserRole.OWNER],
      [ApprovalLevel.DUAL_OWNER]: [UserRole.OWNER],
    }
    return roleHierarchy[level]?.includes(role) ?? false
  }

  async getDashboard(period: "day" | "week" | "month" = "month") {
    const now = new Date()
    const from =
      period === "day"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : period === "week"
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : new Date(now.getFullYear(), now.getMonth(), 1)

    const [payments, expenses, orders, pendingApprovals] = await Promise.all([
      this.prisma.financialTransaction.aggregate({
        where: { type: TransactionType.PAYMENT, createdAt: { gte: from } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.financialTransaction.aggregate({
        where: { type: TransactionType.EXPENSE, createdAt: { gte: from } },
        _sum: { amount: true },
      }),
      this.prisma.workOrder.count({
        where: { status: { in: ["IN_DIAGNOSIS", "IN_PROGRESS", "IN_REVIEW", "BUDGETED"] } },
      }),
      this.prisma.expenseAuthorization.count({ where: { status: ExpenseStatus.PENDING_APPROVAL } }),
    ])

    const totalRevenue = Number(payments._sum.amount ?? 0)
    const totalExpenses = Number(expenses._sum.amount ?? 0)

    return {
      period, from,
      revenue: totalRevenue,
      expenses: totalExpenses,
      profit: totalRevenue - totalExpenses,
      transactionCount: payments._count,
      activeOrders: orders,
      pendingApprovals,
    }
  }

  async getCashflow(from?: Date, to?: Date) {
    const start = from ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = to ?? new Date()

    const [inflowTx, outflowTx] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where: { type: TransactionType.PAYMENT, createdAt: { gte: start, lte: end } },
        select: { paymentMethod: true, amount: true },
      }),
      this.prisma.financialTransaction.findMany({
        where: { type: TransactionType.EXPENSE, createdAt: { gte: start, lte: end } },
        select: { paymentMethod: true, amount: true },
      }),
    ])

    const inflows: Record<string, { count: number; total: number }> = {}
    for (const tx of inflowTx) {
      if (!inflows[tx.paymentMethod]) inflows[tx.paymentMethod] = { count: 0, total: 0 }
      inflows[tx.paymentMethod].count++
      inflows[tx.paymentMethod].total += Number(tx.amount)
    }

    const outflows: Record<string, { count: number; total: number }> = {}
    for (const tx of outflowTx) {
      if (!outflows[tx.paymentMethod]) outflows[tx.paymentMethod] = { count: 0, total: 0 }
      outflows[tx.paymentMethod].count++
      outflows[tx.paymentMethod].total += Number(tx.amount)
    }

    const totalIn = inflowTx.reduce((s, t) => s + Number(t.amount), 0)
    const totalOut = outflowTx.reduce((s, t) => s + Number(t.amount), 0)

    return { from: start, to: end, inflows, outflows, totalIn, totalOut, net: totalIn - totalOut }
  }

  async approveExpenseWithDualApproval(
    expenseId: string,
    approverId: string,
    dto: ApproveExpenseDto,
  ) {
    const expense = await this.prisma.expenseAuthorization.findUnique({ where: { id: expenseId } })
    if (!expense) throw new NotFoundException("Gasto no encontrado")
    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) throw new ConflictException("El gasto ya fue procesado")
    if (expense.requesterId === approverId) {
      throw new ForbiddenException({ message: "No puedes aprobar tus propios gastos", code: "SELF_APPROVAL_FORBIDDEN" })
    }

    const approver = await this.prisma.account.findUnique({
      where: { id: approverId },
      select: { id: true, role: true, name: true },
    })
    if (!approver) throw new NotFoundException("Aprobador no encontrado")
    if (!this.canApproveLevel(approver.role, expense.approvalLevel)) {
      throw new ForbiddenException({
        message: `Tu rol no tiene nivel suficiente (requiere ${expense.approvalLevel})`,
        code: "INSUFFICIENT_APPROVAL_LEVEL",
      })
    }

    if (dto.decision === "REJECTED") {
      return this.prisma.expenseAuthorization.update({
        where: { id: expenseId },
        data: { status: ExpenseStatus.REJECTED, approverId, rejectionReason: dto.rejectionReason, approvedAt: new Date() },
        include: {
          requester: { select: { id: true, name: true, role: true } },
          approver: { select: { id: true, name: true, role: true } },
        },
      })
    }

    const amount = Number(expense.amount)
    if (amount > 500) {
      const metadata = (expense as any).metadata ?? {}
      const approvers: string[] =
        typeof metadata === "object" && Array.isArray(metadata.approvers) ? metadata.approvers : []

      if (approvers.includes(approverId)) {
        throw new ConflictException("Ya aprobaste este gasto. Se requiere un segundo OWNER.")
      }

      approvers.push(approverId)
      if (approvers.length < 2) {
        await this.prisma.expenseAuthorization.update({
          where: { id: expenseId },
          data: { rejectionReason: JSON.stringify({ ...metadata, approvers }) } as any,
        })
        return { status: "PARTIAL_APPROVAL", message: "Primera aprobacion registrada. Se requiere un segundo OWNER." }
      }
    }

    await this.alertQueue.add("expense-disbursed", {
      type: "EXPENSE_DISBURSED",
      expenseId,
      amount: Number(expense.amount),
      category: expense.category,
      timestamp: new Date().toISOString(),
    })

    return this.prisma.expenseAuthorization.update({
      where: { id: expenseId },
      data: { status: ExpenseStatus.DISBURSED, approverId, approvedAt: new Date(), disbursedAt: new Date(), rejectionReason: null },
      include: {
        requester: { select: { id: true, name: true, role: true } },
        approver: { select: { id: true, name: true, role: true } },
      },
    })
  }

  async generatePaymentQR(workOrderId: string, userId: string) {
    const order = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { client: { select: { firstName: true, lastName: true } } },
    })
    if (!order) throw new NotFoundException("Orden no encontrada")
    if (order.paymentStatus === "PAID") throw new ConflictException("Esta orden ya esta pagada")

    const qrToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 60 * 1000)
    const amount = Number(order.finalAmount || order.totalCost || 0)

    await this.redis.set(`qr:payment:${qrToken}`, JSON.stringify({
      workOrderId, amount, orderId: order.number, createdBy: userId,
    }), 420)

    await this.prisma.auditLog.create({
      data: {
        userId, userName: "system", role: "FINANCE" as any,
        action: "PAYMENT_QR_GENERATED", entity: "WorkOrder",
        entityId: workOrderId, severity: "INFO",
        ipAddress: "system",
        metadata: { qrToken, amount, expiresAt } as any,
      },
    })

    return {
      qrToken, amount, orderId: order.number, expiresAt,
      message: "QR valido por 7 minutos. No compartir Yape personal.",
    }
  }

  async confirmPaymentWebhook(qrToken: string, paymentMethod: string, reference?: string) {
    const processed = await this.redis.get(`payment:processed:${qrToken}`)
    if (processed) return { status: "already_processed" }

    const qrData = await this.redis.get(`qr:payment:${qrToken}`)
    if (!qrData) throw new BadRequestException("QR expirado o invalido")

    const { workOrderId, amount } = JSON.parse(qrData)

    await this.redis.set(`payment:processed:${qrToken}`, "processed", 86400)

    const payment = await this.prisma.payment.create({
      data: {
        workOrderId, method: paymentMethod || "YAPE" as any, amount,
        reference: reference || qrToken, isPersonalYape: false,
        receivedBy: "system",
        paidAt: new Date(),
      },
    })

    await this.redis.del(`qr:payment:${qrToken}`)

    this.realtimeGateway?.emitPaymentReceived({
      workOrderId, amount, method: paymentMethod || "YAPE", receivedBy: "system", isAlert: false,
    })

    return { status: "confirmed", payment }
  }

  async createInvoiceDraft(params: {
    workOrderId: string
    clientId: string
    laborCost: number
    partsCost: number
    customsCost: number
    createdBy: string
  }) {
    const year = new Date().getFullYear()
    const count = await this.prisma.invoice.count({
      where: { number: { startsWith: `COT-${year}-` } },
    })
    const number = `COT-${year}-${String(count + 1).padStart(4, "0")}`

    const subtotal = params.laborCost + params.partsCost + params.customsCost
    const tax = Math.round(subtotal * 0.18 * 100) / 100
    const total = subtotal + tax

    const draft = await this.prisma.invoice.upsert({
      where: { workOrderId: params.workOrderId },
      update: {
        subtotal, tax, total,
        dueAmount: total,
        updatedAt: new Date(),
      },
      create: {
        number,
        workOrderId: params.workOrderId,
        clientId: params.clientId,
        subtotal,
        tax,
        total,
        dueAmount: total,
        createdBy: params.createdBy,
      },
    })

    this.logger.log(`Invoice draft ${draft.number} upserted for OT ${params.workOrderId}`)
    return draft
  }
}
