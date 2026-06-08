import { IExpenseRepository } from "../../../domain/finance/ports/i-expense.repository";
export interface ApproveExpenseCommand {
    expenseId: string;
    approverId: string;
    approverRole: string;
    decision: "APPROVED" | "REJECTED";
    rejectionReason?: string;
}
export declare class ApproveExpenseUseCase {
    private readonly repo;
    constructor(repo: IExpenseRepository);
    execute(cmd: ApproveExpenseCommand): Promise<void>;
    private assertApproverHasAuthority;
}
