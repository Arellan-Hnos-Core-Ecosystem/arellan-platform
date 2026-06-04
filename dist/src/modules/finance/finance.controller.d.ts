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
        status: import(".prisma/client").$Enums.CashboxStatus;
        notes: string | null;
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        actualCash: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        closedById: string | null;
        closingBalance: import("@prisma/client/runtime/library").Decimal | null;
        discrepancy: import("@prisma/client/runtime/library").Decimal | null;
        openedAt: Date;
        closedAt: Date | null;
    }>;
    closeCashbox(user: AuthUser, dto: CloseCashboxDto): Promise<{
        transactions: {
            id: string;
            createdAt: Date;
            description: string | null;
            type: import(".prisma/client").$Enums.TransactionType;
            amount: import("@prisma/client/runtime/library").Decimal;
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
        openingBalance: import("@prisma/client/runtime/library").Decimal;
        actualCash: import("@prisma/client/runtime/library").Decimal | null;
        openedById: string;
        closedById: string | null;
        closingBalance: import("@prisma/client/runtime/library").Decimal | null;
        discrepancy: import("@prisma/client/runtime/library").Decimal | null;
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
                amount: import("@prisma/client/runtime/library").Decimal;
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
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            actualCash: import("@prisma/client/runtime/library").Decimal | null;
            openedById: string;
            closedById: string | null;
            closingBalance: import("@prisma/client/runtime/library").Decimal | null;
            discrepancy: import("@prisma/client/runtime/library").Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        };
        message?: undefined;
    }>;
    addTransaction(dto: CreateTransactionDto, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        type: import(".prisma/client").$Enums.TransactionType;
        amount: import("@prisma/client/runtime/library").Decimal;
        integrityHash: string | null;
        orderId: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        sessionId: string;
        referenceToken: string | null;
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
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
        description: string;
        category: import(".prisma/client").$Enums.ExpenseCategory;
        requesterId: string;
        approverId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        rejectionReason: string | null;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
            description: string;
            category: import(".prisma/client").$Enums.ExpenseCategory;
            requesterId: string;
            approverId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
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
                description: string | null;
                type: import(".prisma/client").$Enums.TransactionType;
                amount: import("@prisma/client/runtime/library").Decimal;
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
            openingBalance: import("@prisma/client/runtime/library").Decimal;
            actualCash: import("@prisma/client/runtime/library").Decimal | null;
            openedById: string;
            closedById: string | null;
            closingBalance: import("@prisma/client/runtime/library").Decimal | null;
            discrepancy: import("@prisma/client/runtime/library").Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        })[];
        nextCursor: string | null;
    }>;
}
