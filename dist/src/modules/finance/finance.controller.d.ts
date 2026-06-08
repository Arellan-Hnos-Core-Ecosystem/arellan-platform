import { FinanceService } from "./finance.service";
import { AuthUser } from "../auth/auth.service";
import { OpenCashboxDto, CloseCashboxDto, CreateTransactionDto, CreateExpenseDto, ApproveExpenseDto, ExpenseFiltersDto } from "./dto/finance.dto";
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    openCashbox(user: AuthUser, dto: OpenCashboxDto): Promise<{
        openedBy: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        closingBalance: import("@prisma/client/runtime/library").Decimal | null;
        actualCash: import("@prisma/client/runtime/library").Decimal | null;
        discrepancy: import("@prisma/client/runtime/library").Decimal | null;
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openedAt: Date;
        closedAt: Date | null;
        openedById: string;
        closedById: string | null;
    }>;
    closeCashbox(user: AuthUser, dto: CloseCashboxDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            sessionId: string;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        closingBalance: import("@prisma/client/runtime/library").Decimal | null;
        actualCash: import("@prisma/client/runtime/library").Decimal | null;
        discrepancy: import("@prisma/client/runtime/library").Decimal | null;
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
                amount: import("@prisma/client/runtime/library").Decimal;
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
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            closingBalance: import("@prisma/client/runtime/library").Decimal | null;
            actualCash: import("@prisma/client/runtime/library").Decimal | null;
            discrepancy: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openedAt: Date;
            closedAt: Date | null;
            openedById: string;
            closedById: string | null;
        };
        message?: undefined;
    }>;
    addTransaction(dto: CreateTransactionDto, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        referenceToken: string | null;
        integrityHash: string | null;
        orderId: string | null;
        description: string | null;
        isAudited: boolean;
    }>;
    createExpense(user: AuthUser, dto: CreateExpenseDto): Promise<{
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
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
    getPendingExpenses(user: AuthUser): Promise<({
        requester: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
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
    approveExpense(id: string, user: AuthUser, dto: ApproveExpenseDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
    getCashflow(from?: string, to?: string): Promise<{
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
    getCashboxHistory(limit?: number, cursor?: string): Promise<{
        data: ({
            transactions: {
                id: string;
                createdAt: Date;
                sessionId: string;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: import("@prisma/client/runtime/library").Decimal;
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
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            closingBalance: import("@prisma/client/runtime/library").Decimal | null;
            actualCash: import("@prisma/client/runtime/library").Decimal | null;
            discrepancy: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.CashboxStatus;
            notes: string | null;
            openedAt: Date;
            closedAt: Date | null;
            openedById: string;
            closedById: string | null;
        })[];
        nextCursor: string | null;
    }>;
    generatePaymentQR(user: AuthUser, body: {
        workOrderId: string;
    }): Promise<{
        qrToken: `${string}-${string}-${string}-${string}-${string}`;
        amount: number;
        orderId: string;
        expiresAt: Date;
        message: string;
    }>;
}
