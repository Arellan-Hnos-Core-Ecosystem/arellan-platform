"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FinanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let FinanceService = FinanceService_1 = class FinanceService {
    prisma;
    logger = new common_1.Logger(FinanceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async openCashbox(userId, dto) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const existing = await this.prisma.cashboxSession.findFirst({
            where: {
                openedAt: { gte: todayStart, lte: todayEnd },
                status: "OPEN",
            },
        });
        if (existing) {
            throw new common_1.ConflictException("Ya existe una caja abierta hoy");
        }
        const session = await this.prisma.cashboxSession.create({
            data: {
                openedById: userId,
                openingBalance: dto.openingBalance,
                status: "OPEN",
            },
            include: { openedBy: { select: { id: true, name: true, role: true } } },
        });
        this.logger.log(`Caja abierta por ${userId} con saldo inicial ${dto.openingBalance}`);
        return session;
    }
    async closeCashbox(userId, dto) {
        const session = await this.prisma.cashboxSession.findFirst({
            where: { status: "OPEN" },
            include: { transactions: true },
        });
        if (!session) {
            throw new common_1.NotFoundException("No hay una caja abierta para cerrar");
        }
        const paymentSum = session.transactions
            .filter((t) => t.type === client_1.TransactionType.PAYMENT)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenseSum = session.transactions
            .filter((t) => t.type === client_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expected = Number(session.openingBalance) + paymentSum - expenseSum;
        const discrepancy = dto.actualCash - expected;
        if (Math.abs(discrepancy) > 10 && Math.abs(discrepancy) <= 50) {
            this.logger.warn(`Discrepancia de caja ${+discrepancy.toFixed(2)} en sesion ${session.id}`);
        }
        else if (Math.abs(discrepancy) > 50) {
            this.logger.error(`POSIBLE FRAUDE: Discrepancia de caja ${+discrepancy.toFixed(2)} en sesion ${session.id}`);
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
        });
        this.logger.log(`Caja ${session.id} cerrada por ${userId}`);
        return closed;
    }
    async getTodaySession() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
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
        });
        if (!session) {
            return { open: false, message: "No hay caja abierta hoy" };
        }
        return { open: true, session };
    }
    async addTransaction(sessionId, dto) {
        const session = await this.prisma.cashboxSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException("Sesion de caja no encontrada");
        }
        if (session.status !== "OPEN") {
            throw new common_1.ConflictException("La caja no esta abierta");
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
        });
        this.logger.log(`Transaccion ${transaction.id} (${dto.type}) agregada a sesion ${sessionId}`);
        return transaction;
    }
    async createExpense(requesterId, dto) {
        const approvalLevel = this.determineApprovalLevel(dto.amount);
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
        });
        this.logger.log(`Gasto ${expense.id} creado por ${requesterId} nivel ${approvalLevel} monto ${dto.amount}`);
        return expense;
    }
    async approveExpense(expenseId, approverId, dto) {
        const expense = await this.prisma.expenseAuthorization.findUnique({
            where: { id: expenseId },
        });
        if (!expense) {
            throw new common_1.NotFoundException("Gasto no encontrado");
        }
        if (expense.status !== "PENDING_APPROVAL") {
            throw new common_1.ConflictException("El gasto ya fue procesado");
        }
        if (expense.requesterId === approverId) {
            throw new common_1.ForbiddenException({
                message: "No puedes aprobar tus propios gastos",
                code: "SELF_APPROVAL_FORBIDDEN",
            });
        }
        const approver = await this.prisma.account.findUnique({
            where: { id: approverId },
            select: { id: true, role: true, name: true },
        });
        if (!approver) {
            throw new common_1.NotFoundException("Aprobador no encontrado");
        }
        if (!this.canApproveLevel(approver.role, expense.approvalLevel)) {
            throw new common_1.ForbiddenException({
                message: `Tu rol no tiene nivel suficiente para aprobar este gasto (requiere ${expense.approvalLevel})`,
                code: "INSUFFICIENT_APPROVAL_LEVEL",
            });
        }
        if (dto.decision === "REJECTED") {
            const rejected = await this.prisma.expenseAuthorization.update({
                where: { id: expenseId },
                data: {
                    status: client_1.ExpenseStatus.REJECTED,
                    approverId,
                    rejectionReason: dto.rejectionReason,
                    approvedAt: new Date(),
                },
                include: {
                    requester: { select: { id: true, name: true, role: true } },
                    approver: { select: { id: true, name: true, role: true } },
                },
            });
            this.logger.log(`Gasto ${expenseId} RECHAZADO por ${approverId}`);
            return rejected;
        }
        const newStatus = client_1.ExpenseStatus.DISBURSED;
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
        });
        this.logger.log(`Gasto ${expenseId} APROBADO por ${approverId} (nivel ${expense.approvalLevel})`);
        return approved;
    }
    async getPendingExpenses(approverId) {
        const where = {
            status: "PENDING_APPROVAL",
        };
        if (approverId) {
            where.requesterId = { not: approverId };
        }
        return this.prisma.expenseAuthorization.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                requester: { select: { id: true, name: true, role: true } },
            },
        });
    }
    async getExpenses(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.category) {
            where.category = filters.category;
        }
        if (filters.requesterId) {
            where.requesterId = filters.requesterId;
        }
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate);
            }
        }
        const page = filters.page || 1;
        const size = filters.size || 20;
        const skip = (page - 1) * size;
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
        ]);
        return {
            data,
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
        };
    }
    async getCashboxHistory(limit, cursor) {
        const take = limit && limit > 0 && limit <= 100 ? limit : 20;
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
        });
        let nextCursor = null;
        if (sessions.length > take) {
            const nextItem = sessions.pop();
            nextCursor = nextItem.id;
        }
        return { data: sessions, nextCursor };
    }
    determineApprovalLevel(amount) {
        if (amount <= 100)
            return client_1.ApprovalLevel.FINANCE;
        if (amount <= 500)
            return client_1.ApprovalLevel.ADMIN;
        if (amount <= 2000)
            return client_1.ApprovalLevel.OWNER;
        return client_1.ApprovalLevel.DUAL_OWNER;
    }
    canApproveLevel(role, level) {
        const roleHierarchy = {
            [client_1.ApprovalLevel.FINANCE]: [client_1.UserRole.FINANCE, client_1.UserRole.ADMIN, client_1.UserRole.OWNER],
            [client_1.ApprovalLevel.ADMIN]: [client_1.UserRole.ADMIN, client_1.UserRole.OWNER],
            [client_1.ApprovalLevel.OWNER]: [client_1.UserRole.OWNER],
            [client_1.ApprovalLevel.DUAL_OWNER]: [client_1.UserRole.OWNER],
        };
        return roleHierarchy[level]?.includes(role) ?? false;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = FinanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map