import { CashAmount } from "../value-objects/cash-amount.vo";
export type ExpenseStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "DISBURSED";
export type ApprovalLevel = "FINANCE" | "ADMIN" | "OWNER" | "DUAL";
export interface ExpenseProps {
    id: string;
    description: string;
    amount: CashAmount;
    status: ExpenseStatus;
    category: string;
    orderId: string | null;
    requestedById: string;
    approvedById: string | null;
    rejectedReason: string | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Expense {
    private readonly props;
    private constructor();
    static create(params: Omit<ExpenseProps, "status" | "approvedById" | "rejectedReason" | "approvedAt" | "createdAt" | "updatedAt">): Expense;
    static reconstitute(props: ExpenseProps): Expense;
    get id(): string;
    get amount(): CashAmount;
    get status(): ExpenseStatus;
    get category(): string;
    get requestedById(): string;
    get orderId(): string | null;
    requiredApprovalLevel(): ApprovalLevel;
    approve(approverId: string): Expense;
    reject(approverId: string, reason: string): Expense;
    disburse(): Expense;
}
