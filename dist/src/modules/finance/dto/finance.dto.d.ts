import { TransactionType, PaymentMethod, ExpenseCategory, Currency } from "@prisma/client";
export declare class OpenCashboxDto {
    openingBalance: number;
}
export declare class CloseCashboxDto {
    actualCash: number;
    notes?: string;
    justificationText?: string;
}
export declare class DeliverVehicleDto {
    clientSignature: string;
    paymentMethod: string;
}
export declare class CashboxOverrideDto {
    sessionId: string;
    totpCode: string;
    overrideReason?: string;
}
export declare class CreateTransactionDto {
    type: TransactionType;
    amount: number;
    paymentMethod: PaymentMethod;
    orderId?: string;
    description?: string;
}
export declare class CreateExpenseDto {
    amount: number;
    currency?: Currency;
    category: ExpenseCategory;
    description: string;
    invoiceUrl?: string;
}
export declare class ApproveExpenseDto {
    decision: "APPROVED" | "REJECTED";
    rejectionReason?: string;
}
export declare class ExpenseFiltersDto {
    status?: string;
    category?: string;
    requesterId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    pageSize?: number;
}
