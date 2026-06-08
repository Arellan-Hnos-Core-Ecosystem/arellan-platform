import { WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { RealtimeGateway } from "../common/gateway/realtime.gateway";
interface CashboxDiscrepancyJob {
    type: "CASHBOX_DISCREPANCY";
    sessionId: string;
    userId: string;
    discrepancy: string;
    expected: string;
    actual: string;
    timestamp: string;
}
interface ExpenseApprovalJob {
    type: "EXPENSE_APPROVAL_REQUIRED";
    expenseId: string;
    requesterId: string;
    amount: number;
    description: string;
    approvalLevel: number;
    timestamp: string;
}
interface SuspiciousExpenseJob {
    type: "SUSPICIOUS_EXPENSE";
    expenseId: string;
    requesterId: string;
    amount: number;
    category: string;
    approvalLevel: number;
    timestamp: string;
}
interface ExpenseDisbursedJob {
    type: "EXPENSE_DISBURSED";
    expenseId: string;
    amount: number;
    category: string;
    timestamp: string;
}
type AlertJob = CashboxDiscrepancyJob | ExpenseApprovalJob | SuspiciousExpenseJob | ExpenseDisbursedJob;
export declare class AlertDispatcherProcessor extends WorkerHost {
    private readonly realtimeGateway;
    private readonly logger;
    constructor(realtimeGateway: RealtimeGateway);
    process(job: Job<AlertJob, void, string>): Promise<void>;
    onFailed(job: Job, error: Error): void;
}
export {};
