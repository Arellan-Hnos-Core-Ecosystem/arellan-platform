import { PrismaService } from "../../common/prisma/prisma.service";
import { OpenCashboxDto, CloseCashboxDto, CreateTransactionDto, CreateExpenseDto, ApproveExpenseDto, ExpenseFiltersDto } from "./dto/finance.dto";
import { Prisma } from "@prisma/client";
export declare class FinanceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    openCashbox(userId: string, dto: OpenCashboxDto): Promise<{
        openedBy: {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CashboxStatus;
        openingBalance: Prisma.Decimal;
        actualCash: Prisma.Decimal | null;
        notes: string | null;
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
            type: import(".prisma/client").$Enums.TransactionType;
            description: string | null;
            orderId: string | null;
            amount: Prisma.Decimal;
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
        openingBalance: Prisma.Decimal;
        actualCash: Prisma.Decimal | null;
        notes: string | null;
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
                type: import(".prisma/client").$Enums.TransactionType;
                description: string | null;
                orderId: string | null;
                amount: Prisma.Decimal;
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
            openingBalance: Prisma.Decimal;
            actualCash: Prisma.Decimal | null;
            notes: string | null;
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
        type: import(".prisma/client").$Enums.TransactionType;
        description: string | null;
        orderId: string | null;
        amount: Prisma.Decimal;
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
        category: import(".prisma/client").$Enums.ExpenseCategory;
        description: string;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        rejectionReason: string | null;
        requesterId: string;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
        category: import(".prisma/client").$Enums.ExpenseCategory;
        description: string;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        rejectionReason: string | null;
        requesterId: string;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
        category: import(".prisma/client").$Enums.ExpenseCategory;
        description: string;
        amount: Prisma.Decimal;
        currency: import(".prisma/client").$Enums.Currency;
        invoiceUrl: string | null;
        rejectionReason: string | null;
        requesterId: string;
        approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
        approvedAt: Date | null;
        disbursedAt: Date | null;
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
            category: import(".prisma/client").$Enums.ExpenseCategory;
            description: string;
            amount: Prisma.Decimal;
            currency: import(".prisma/client").$Enums.Currency;
            invoiceUrl: string | null;
            rejectionReason: string | null;
            requesterId: string;
            approvalLevel: import(".prisma/client").$Enums.ApprovalLevel;
            approvedAt: Date | null;
            disbursedAt: Date | null;
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
                type: import(".prisma/client").$Enums.TransactionType;
                description: string | null;
                orderId: string | null;
                amount: Prisma.Decimal;
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
            openingBalance: Prisma.Decimal;
            actualCash: Prisma.Decimal | null;
            notes: string | null;
            openedById: string;
            closedById: string | null;
            closingBalance: Prisma.Decimal | null;
            discrepancy: Prisma.Decimal | null;
            openedAt: Date;
            closedAt: Date | null;
        })[];
        nextCursor: string | null;
    }>;
    private determineApprovalLevel;
    private canApproveLevel;
}
