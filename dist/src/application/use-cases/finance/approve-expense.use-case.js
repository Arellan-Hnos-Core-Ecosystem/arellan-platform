"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveExpenseUseCase = void 0;
class ApproveExpenseUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        const expense = await this.repo.findById(cmd.expenseId);
        if (!expense)
            throw new Error(`Expense ${cmd.expenseId} not found`);
        this.assertApproverHasAuthority(expense.amount, cmd.approverRole);
        const updated = cmd.decision === "APPROVED"
            ? expense.approve(cmd.approverId)
            : expense.reject(cmd.approverId, cmd.rejectionReason ?? "");
        await this.repo.update(updated);
    }
    assertApproverHasAuthority(amount, role) {
        const required = amount.requiresApprovalLevel();
        const roleHierarchy = { FINANCE: 1, ADMIN: 2, OWNER: 3 };
        const requiredLevel = { FINANCE: 1, ADMIN: 2, OWNER: 3, DUAL: 3 };
        const approverLevel = roleHierarchy[role] ?? 0;
        const neededLevel = requiredLevel[required];
        if (approverLevel < neededLevel) {
            throw new Error(`Role ${role} lacks authority to approve ${amount.toFixed()}. Required: ${required}`);
        }
    }
}
exports.ApproveExpenseUseCase = ApproveExpenseUseCase;
//# sourceMappingURL=approve-expense.use-case.js.map