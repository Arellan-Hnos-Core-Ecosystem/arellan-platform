import { CashAmount } from "../../../domain/finance/value-objects/cash-amount.vo";
import { IExpenseRepository } from "../../../domain/finance/ports/i-expense.repository";

export interface ApproveExpenseCommand {
  expenseId: string;
  approverId: string;
  approverRole: string;
  decision: "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export class ApproveExpenseUseCase {
  constructor(private readonly repo: IExpenseRepository) {}

  async execute(cmd: ApproveExpenseCommand): Promise<void> {
    const expense = await this.repo.findById(cmd.expenseId);
    if (!expense) throw new Error(`Expense ${cmd.expenseId} not found`);

    this.assertApproverHasAuthority(expense.amount, cmd.approverRole);

    const updated =
      cmd.decision === "APPROVED"
        ? expense.approve(cmd.approverId)
        : expense.reject(cmd.approverId, cmd.rejectionReason ?? "");

    await this.repo.update(updated);
  }

  private assertApproverHasAuthority(amount: CashAmount, role: string): void {
    const required = amount.requiresApprovalLevel();
    const roleHierarchy = { FINANCE: 1, ADMIN: 2, OWNER: 3 };
    const requiredLevel = { FINANCE: 1, ADMIN: 2, OWNER: 3, DUAL: 3 };

    const approverLevel = roleHierarchy[role as keyof typeof roleHierarchy] ?? 0;
    const neededLevel = requiredLevel[required];

    if (approverLevel < neededLevel) {
      throw new Error(
        `Role ${role} lacks authority to approve ${amount.toFixed()}. Required: ${required}`
      );
    }
  }
}
