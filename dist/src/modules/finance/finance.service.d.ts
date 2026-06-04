import { Queue } from "bullmq";
import { PrismaService } from "../../common/prisma/prisma.service";
import { OpenCashboxDto, CloseCashboxDto, CreateTransactionDto, CreateExpenseDto, ApproveExpenseDto, ExpenseFiltersDto } from "./dto/finance.dto";
import { Prisma } from "@prisma/client";
export declare class FinanceService {
    private readonly prisma;
    private readonly alertQueue;
    private readonly logger;
    constructor(prisma: PrismaService, alertQueue: Queue);
    openCashbox(userId: string, dto: OpenCashboxDto): Promise<{
        openedBy: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openingBalance: Prisma.Decimal;
        actualCash: Prisma.Decimal | null;
        openedById: string;
        closedById: string | null;
        closingBalance: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    closeCashbox(userId: string, dto: CloseCashboxDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: Prisma.Decimal;
            integrityHash: string | null;
            orderId: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            sessionId: string;
            referenceToken: string | null;
            isAudited: boolean;
        }[];
        closedBy: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openingBalance: Prisma.Decimal;
        actualCash: Prisma.Decimal | null;
        openedById: string;
        closedById: string | null;
        closingBalance: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    getTodaySession(): Promise<{
        open: boolean;
        message: string;
        session?: undefined;
    } | {
        open: boolean;
        session: {
            transactions: {
                id: string;
                createdAt: Date;
                description: string | null;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                integrityHash: string | null;
                orderId: string | null;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                sessionId: string;
                referenceToken: string | null;
                isAudited: boolean;
            }[];
            openedBy: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openingBalance: Prisma.Decimal;
            actualCash: Prisma.Decimal | null;
            openedById: string;
            closedById: string | null;
            closingBalance: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        };
        message?: undefined;
    }>;
    addTransaction(sessionId: string, dto: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: Prisma.Decimal;
        integrityHash: string | null;
        orderId: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        sessionId: string;
        referenceToken: string | null;
        isAudited: boolean;
    }>;
    createExpense(requesterId: string, dto: CreateExpenseDto): Promise<{
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }>;
    approveExpense(expenseId: string, approverId: string, dto: ApproveExpenseDto): Promise<{
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
        approver: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }>;
    getPendingExpenses(approverId?: string): Promise<({
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    })[]>;
    getExpenses(filters: ExpenseFiltersDto): Promise<{
        data: ({
            requester: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            };
            approver: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ExpenseStatus;
            createdAt: Date;
            description: string;
            category: import(".prisma/client").$Enums.ExpenseCategory;
            requesterId: string;
            approverId: string | null;
            amount: Prisma.Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            invoiceUrl: string | null;
            approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
            rejectionReason: string | null;
            approvedAt: Date | null;
            disbursedAt: Date | null;
        })[];
        total: number;
        page: number;
        size: number;
        totalPages: number;
    }>;
    getCashboxHistory(limit?: number, cursor?: string): Promise<{
        data: ({
            transactions: {
                id: string;
                createdAt: Date;
                description: string | null;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                integrityHash: string | null;
                orderId: string | null;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                sessionId: string;
                referenceToken: string | null;
                isAudited: boolean;
            }[];
            openedBy: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            };
            closedBy: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openingBalance: Prisma.Decimal;
            actualCash: Prisma.Decimal | null;
            openedById: string;
            closedById: string | null;
            closingBalance: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        })[];
        nextCursor: string | null;
    }>;
    getCommissions(query: {
        status?: string;
        personnelId?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: ({
            personnel: {
                firstName: string;
                lastName: string;
            };
            supplier: {
                name: string;
            } | null;
        } & {
            id: string;
            status: import(".prisma/client").$Enums.ApprovalStatus;
            createdAt: Date;
            notes: string | null;
            type: string;
            supplierId: string | null;
            personnelId: string;
            amount: Prisma.Decimal;
            paidAt: Date | null;
            purchaseId: string | null;
            percentage: Prisma.Decimal | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private determineApprovalLevel;
    private canApproveLevel;
    getDashboard(period?: "day" | "week" | "month"): Promise<{
        period: "week" | "day" | "month";
        from: Date;
        revenue: number;
        expenses: number;
        profit: number;
        transactionCount: number;
        activeOrders: number;
        pendingApprovals: number;
    }>;
    getCashflow(from?: Date, to?: Date): Promise<{
        from: Date;
        to: Date;
        inflows: Record<string, {
            count: number;
            total: number;
        }>;
        outflows: Record<string, {
            count: number;
            total: number;
        }>;
        totalIn: number;
        totalOut: number;
        net: number;
    }>;
    approveExpenseWithDualApproval(expenseId: string, approverId: string, dto: ApproveExpenseDto): Promise<({
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
        approver: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }) | {
        status: string;
        message: string;
    }>;
}
