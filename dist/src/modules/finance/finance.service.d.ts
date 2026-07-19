import { Queue } from "bullmq";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { RealtimeGateway } from "../../common/gateway/realtime.gateway";
import { OpenCashboxDto, CloseCashboxDto, CreateTransactionDto, CreateExpenseDto, ApproveExpenseDto, ExpenseFiltersDto } from "./dto/finance.dto";
import { Prisma } from "@prisma/client";
export declare class FinanceService {
    private readonly prisma;
    private readonly redis;
    private readonly realtimeGateway;
    private readonly alertQueue;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, realtimeGateway: RealtimeGateway, alertQueue: Queue);
    openCashbox(userId: string, dto: OpenCashboxDto): Promise<{
        openedBy: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openingBalance: Prisma.Decimal;
        closingBalance: Prisma.Decimal | null;
        actualCash: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        justificationText: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
    }>;
    closeCashbox(userId: string, dto: CloseCashboxDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            description: string | null;
            type: import("@prisma/client").$Enums.TransactionType;
            amount: Prisma.Decimal;
            integrityHash: string | null;
            orderId: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            sessionId: string;
            referenceToken: string | null;
            isAudited: boolean;
        }[];
        closedBy: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openingBalance: Prisma.Decimal;
        closingBalance: Prisma.Decimal | null;
        actualCash: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        justificationText: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
    }>;
    getTodaySession(): Promise<{
        open: boolean;
        message: string;
    } | {
        open: boolean;
        session: {
            openingBalance: number;
            initialAmount: number;
            openedByName: string;
            transactions: {
                id: string;
                createdAt: Date;
                description: string | null;
                type: import("@prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                integrityHash: string | null;
                orderId: string | null;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                sessionId: string;
                referenceToken: string | null;
                isAudited: boolean;
            }[];
            openedBy: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            closingBalance: Prisma.Decimal | null;
            actualCash: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            justificationText: string | null;
            openedAt: Date;
            closedAt: Date | null;
            openedById: string;
            closedById: string | null;
        };
        openingBalance: number;
        initialAmount: number;
        openedByName: string;
        transactions: {
            id: string;
            createdAt: Date;
            description: string | null;
            type: import("@prisma/client").$Enums.TransactionType;
            amount: Prisma.Decimal;
            integrityHash: string | null;
            orderId: string | null;
            paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
            sessionId: string;
            referenceToken: string | null;
            isAudited: boolean;
        }[];
        openedBy: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
        id: string;
        status: import("@prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        closingBalance: Prisma.Decimal | null;
        actualCash: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        justificationText: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
        message?: undefined;
    }>;
    addTransaction(sessionId: string, dto: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: import("@prisma/client").$Enums.TransactionType;
        amount: Prisma.Decimal;
        integrityHash: string | null;
        orderId: string | null;
        paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
        sessionId: string;
        referenceToken: string | null;
        isAudited: boolean;
    }>;
    createExpense(requesterId: string, dto: CreateExpenseDto): Promise<{
        requester: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import("@prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import("@prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }>;
    approveExpense(expenseId: string, approverId: string, dto: ApproveExpenseDto): Promise<({
        requester: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
        approver: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        status: import("@prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: Prisma.Decimal;
        currency: import("@prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import("@prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }) | {
        status: string;
        message: string;
        expense: {
            requester: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            };
            approver: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ExpenseStatus;
            createdAt: Date;
            description: string;
            category: import("@prisma/client").$Enums.ExpenseCategory;
            requesterId: string;
            approverId: string | null;
            amount: Prisma.Decimal;
            currency: import("@prisma/client").$Enums.Currency;
            invoiceUrl: string | null;
            approvalLevel: import("@prisma/client").$Enums.ApprovalLevel;
            rejectionReason: string | null;
            approvedAt: Date | null;
            disbursedAt: Date | null;
        };
    }>;
    getPendingExpenses(approverId?: string): Promise<{
        amount: number;
        requestedBy: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
        requester: {
            id: string;
            role: import("@prisma/client").$Enums.UserRole;
            name: string;
        };
        id: string;
        status: import("@prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        description: string;
        category: import("@prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        currency: import("@prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import("@prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
    }[]>;
    getExpenses(filters: ExpenseFiltersDto): Promise<{
        data: ({
            requester: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            };
            approver: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ExpenseStatus;
            createdAt: Date;
            description: string;
            category: import("@prisma/client").$Enums.ExpenseCategory;
            requesterId: string;
            approverId: string | null;
            amount: Prisma.Decimal;
            currency: import("@prisma/client").$Enums.Currency;
            invoiceUrl: string | null;
            approvalLevel: import("@prisma/client").$Enums.ApprovalLevel;
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
                type: import("@prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                integrityHash: string | null;
                orderId: string | null;
                paymentMethod: import("@prisma/client").$Enums.PaymentMethod;
                sessionId: string;
                referenceToken: string | null;
                isAudited: boolean;
            }[];
            openedBy: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            };
            closedBy: {
                id: string;
                role: import("@prisma/client").$Enums.UserRole;
                name: string;
            } | null;
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openingBalance: Prisma.Decimal;
            closingBalance: Prisma.Decimal | null;
            actualCash: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            justificationText: string | null;
            openedAt: Date;
            closedAt: Date | null;
            openedById: string;
            closedById: string | null;
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
            status: import("@prisma/client").$Enums.ApprovalStatus;
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
    generatePaymentQR(workOrderId: string, userId: string): Promise<{
        qrToken: `${string}-${string}-${string}-${string}-${string}`;
        amount: number;
        orderId: string;
        expiresAt: Date;
        message: string;
    }>;
    confirmPaymentWebhook(qrToken: string, paymentMethod: string, reference?: string): Promise<{
        status: string;
        payment?: undefined;
    } | {
        status: string;
        payment: {
            id: string;
            createdAt: Date;
            notes: string | null;
            verifiedBy: string | null;
            amount: Prisma.Decimal;
            workOrderId: string | null;
            invoiceId: string | null;
            method: import("@prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            receivedBy: string;
            channel: import("@prisma/client").$Enums.PaymentChannel;
            isPersonalYape: boolean;
            yapeAccount: string | null;
            receiptUrl: string | null;
            paidAt: Date;
        };
    }>;
    createInvoiceDraft(params: {
        workOrderId: string;
        clientId: string;
        laborCost: number;
        partsCost: number;
        customsCost: number;
        createdBy: string;
    }): Promise<{
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.InvoiceStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import("@prisma/client").$Enums.InvoiceType;
        clientId: string;
        discount: Prisma.Decimal;
        tax: Prisma.Decimal;
        createdBy: string;
        workOrderId: string | null;
        paidAt: Date | null;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        paidAmount: Prisma.Decimal;
        dueAmount: Prisma.Decimal;
        dueDate: Date | null;
        issuedAt: Date | null;
        cancelledAt: Date | null;
        cancelReason: string | null;
    }>;
}
