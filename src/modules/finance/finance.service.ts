import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common"
import { PrismaService } from "../../common/prisma/prisma.service"
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

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name)

  constructor(private readonly prisma: PrismaService) {}

  async openCashbox(userId: string, dto: OpenCashboxDto) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const existing = await this.prisma.cashboxSession.findFirst({
      where: {
        openedAt: { gte: todayStart, lte: todayEnd },
        status: "OPEN",
      },
    })

    if (existing) {
      throw new ConflictException("Ya existe una caja abierta hoy")
    }

    const session = await this.prisma.cashboxSession.create({
      data: {
        openedById: userId,
        openingBalance: dto.openingBalance,
        status: "OPEN",
      },
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

    if (!session) {
      throw new NotFoundException("No hay una caja abierta para cerrar")
    }

    const paymentSum = session.transactions
      .filter((t) => t.type === TransactionType.PAYMENT)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenseSum = session.transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expected =
      Number(session.openingBalance) + paymentSum - expenseSum

    const discrepancy = dto.actualCash - expected

    if (Math.abs(discrepancy) > 10 && Math.abs(discrepancy) <= 50) {
      this.logger.warn(
        `Discrepancia de caja ${+discrepancy.toFixed(2)} en sesion ${session.id}`
      )
    } else if (Math.abs(discrepancy) > 50) {
      this.logger.error(
        `POSIBLE FRAUDE: Discrepancia de caja ${+discrepancy.toFixed(2)} en sesion ${session.id}`
      )
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
      where: {
        openedAt: { gte: todayStart, lte: todayEnd },
        status: "OPEN",
      },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
        },
        openedBy: { select: { id: true, name: true, role: true } },
      },
    })

    if (!session) {
      return { open: false, message: "No hay caja abierta hoy" }
    }

    return { open: true, session }
  }

  async addTransaction(sessionId: string, dto: CreateTransactionDto) {
    const session = await this.prisma.cashboxSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new NotFoundException("Sesion de caja no encontrada")
    }

    if (session.status !== "OPEN") {
      throw new ConflictException("La caja no esta abierta")
    }

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

    this.logger.log(
      `Transaccion ${transaction.id} (${dto.type}) agregada a sesion ${sessionId}`
    )
    return transaction
  }

  async createExpense(requesterId: string, dto: CreateExpenseDto) {
    const approvalLevel = this.determineApprovalLevel(dto.amount)

    const expense = await this.prisma.expenseAuthorization.create({
      data: {
        requesterId,
        amount: dto.amount,
        currency: dto.currency || "PEN",
        category: dto.category,
        description: dto.description,
        invoiceUrl: dto.invoiceUrl || null,
        status: "PENDING_APPROVAL",
        approvalLevel,
      },
      include: {
        requester: { select: { id: true, name: true, role: true } },
      },
    })

    this.logger.log(
      `Gasto ${expense.id} creado por ${requesterId} nivel ${approvalLevel} monto ${dto.amount}`
    )
    return expense
  }

  async approveExpense(
    expenseId: string,
    approverId: string,
    dto: ApproveExpenseDto
  ) {
    const expense = await this.prisma.expenseAuthorization.findUnique({
      where: { id: expenseId },
    })

    if (!expense) {
      throw new NotFoundException("Gasto no encontrado")
    }

    if (expense.status !== "PENDING_APPROVAL") {
      throw new ConflictException("El gasto ya fue procesado")
    }

    if (expense.requesterId === approverId) {
      throw new ForbiddenException({
        message: "No puedes aprobar tus propios gastos",
        code: "SELF_APPROVAL_FORBIDDEN",
      })
    }

    const approver = await this.prisma.account.findUnique({
      where: { id: approverId },
      select: { id: true, role: true, name: true },
    })

    if (!approver) {
      throw new NotFoundException("Aprobador no encontrado")
    }

    if (!this.canApproveLevel(approver.role, expense.approvalLevel)) {
      throw new ForbiddenException({
        message: `Tu rol no tiene nivel suficiente para aprobar este gasto (requiere ${expense.approvalLevel})`,
        code: "INSUFFICIENT_APPROVAL_LEVEL",
      })
    }

    if (dto.decision === "REJECTED") {
      const rejected = await this.prisma.expenseAuthorization.update({
        where: { id: expenseId },
        data: {
          status: ExpenseStatus.REJECTED,
          approverId,
          rejectionReason: dto.rejectionReason,
          approvedAt: new Date(),
        },
        include: {
          requester: { select: { id: true, name: true, role: true } },
          approver: { select: { id: true, name: true, role: true } },
        },
      })

      this.logger.log(`Gasto ${expenseId} RECHAZADO por ${approverId}`)
      return rejected
    }

    const newStatus = ExpenseStatus.DISBURSED

    const approved = await this.prisma.expenseAuthorization.update({
      where: { id: expenseId },
      data: {
        status: newStatus,
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

    this.logger.log(
      `Gasto ${expenseId} APROBADO por ${approverId} (nivel ${expense.approvalLevel})`
    )
    return approved
  }

  async getPendingExpenses(approverId?: string) {
    const where: Prisma.ExpenseAuthorizationWhereInput = {
      status: "PENDING_APPROVAL",
    }

    if (approverId) {
      where.requesterId = { not: approverId }
    }

    return this.prisma.expenseAuthorization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { id: true, name: true, role: true } },
      },
    })
  }

  async getExpenses(filters: ExpenseFiltersDto) {
    const where: Prisma.ExpenseAuthorizationWhereInput = {}

    if (filters.status) {
      where.status = filters.status as ExpenseStatus
    }
    if (filters.category) {
      where.category = filters.category as any
    }
    if (filters.requesterId) {
      where.requesterId = filters.requesterId
    }
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate)
      }
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

    return {
      data,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    }
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
}
