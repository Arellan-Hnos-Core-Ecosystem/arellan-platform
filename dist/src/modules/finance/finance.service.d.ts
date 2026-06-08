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
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        openingBalance: Prisma.Decimal;
        closingBalance: Prisma.Decimal | null;
        actualCash: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
    }>;
    closeCashbox(userId: string, dto: CloseCashboxDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            sessionId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: Prisma.Decimal;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            referenceToken: string | null;
            integrityHash: string | null;
            orderId: string | null;
            description: string | null;
            isAudited: boolean;
        }[];
        closedBy: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        } | null;
    } & {
        id: string;
        openingBalance: Prisma.Decimal;
        closingBalance: Prisma.Decimal | null;
        actualCash: Prisma.Decimal | null;
        discrepancy: Prisma.Decimal | null;
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
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
                sessionId: string;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                referenceToken: string | null;
                integrityHash: string | null;
                orderId: string | null;
                description: string | null;
                isAudited: boolean;
            }[];
            openedBy: {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                name: string;
            };
        } & {
            id: string;
            openingBalance: Prisma.Decimal;
            closingBalance: Prisma.Decimal | null;
            actualCash: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openedAt: Date;
            closedAt: Date | null;
            openedById: string;
            closedById: string | null;
        };
        message?: undefined;
    }>;
    addTransaction(sessionId: string, dto: CreateTransactionDto): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: Prisma.Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        referenceToken: string | null;
        integrityHash: string | null;
        orderId: string | null;
        description: string | null;
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
        amount: Prisma.Decimal;
        description: string;
        currency: import(".prisma/client").$Enums.Currency;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
        requesterId: string;
        approverId: string | null;
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
        amount: Prisma.Decimal;
        description: string;
        currency: import(".prisma/client").$Enums.Currency;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
        requesterId: string;
        approverId: string | null;
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
        amount: Prisma.Decimal;
        description: string;
        currency: import(".prisma/client").$Enums.Currency;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
        requesterId: string;
        approverId: string | null;
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
            amount: Prisma.Decimal;
            description: string;
            currency: import(".prisma/client").$Enums.Currency;
            category: import(".prisma/client").$Enums.ExpenseCategory;
            invoiceUrl: string | null;
            approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
            rejectionReason: string | null;
            approvedAt: Date | null;
            disbursedAt: Date | null;
            requesterId: string;
            approverId: string | null;
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
                sessionId: string;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: Prisma.Decimal;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
                referenceToken: string | null;
                integrityHash: string | null;
                orderId: string | null;
                description: string | null;
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
            openingBalance: Prisma.Decimal;
            closingBalance: Prisma.Decimal | null;
            actualCash: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
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
            status: import(".prisma/client").$Enums.ApprovalStatus;
            notes: string | null;
            createdAt: Date;
            type: string;
            amount: Prisma.Decimal;
            personnelId: string;
            supplierId: string | null;
            purchaseId: string | null;
            percentage: Prisma.Decimal | null;
            paidAt: Date | null;
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
        period: "day" | "week" | "month";
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
        amount: Prisma.Decimal;
        description: string;
        currency: import(".prisma/client").$Enums.Currency;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
        requesterId: string;
        approverId: string | null;
    }) | {
        status: string;
        message: string;
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
            notes: string | null;
            createdAt: Date;
            amount: Prisma.Decimal;
            paidAt: Date;
            method: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            receivedBy: string;
            verifiedBy: string | null;
            channel: import(".prisma/client").$Enums.PaymentChannel;
            isPersonalYape: boolean;
            yapeAccount: string | null;
            receiptUrl: string | null;
            invoiceId: string | null;
            workOrderId: string | null;
        };
    }>;
}
