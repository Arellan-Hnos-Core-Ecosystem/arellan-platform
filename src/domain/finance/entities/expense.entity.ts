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

export class Expense {
  private constructor(private readonly props: ExpenseProps) {}

  static create(params: Omit<ExpenseProps, "status" | "approvedById" | "rejectedReason" | "approvedAt" | "createdAt" | "updatedAt">): Expense {
    return new Expense({
      ...params,
      status: "PENDING_APPROVAL",
      approvedById: null,
      rejectedReason: null,
      approvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: ExpenseProps): Expense {
    return new Expense(props);
  }

  get id() { return this.props.id; }
  get amount() { return this.props.amount; }
  get status() { return this.props.status; }
  get category() { return this.props.category; }
  get requestedById() { return this.props.requestedById; }
  get orderId() { return this.props.orderId; }

  requiredApprovalLevel(): ApprovalLevel {
    return this.props.amount.requiresApprovalLevel();
  }

  approve(approverId: string): Expense {
    if (this.props.status !== "PENDING_APPROVAL") {
      throw new Error(`Cannot approve expense in status ${this.props.status}`);
    }
    return new Expense({
      ...this.props,
      status: "APPROVED",
      approvedById: approverId,
      approvedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  reject(approverId: string, reason: string): Expense {
    if (this.props.status !== "PENDING_APPROVAL") {
      throw new Error(`Cannot reject expense in status ${this.props.status}`);
    }
    if (!reason?.trim()) {
      throw new Error("Rejection reason is required");
    }
    return new Expense({
      ...this.props,
      status: "REJECTED",
      approvedById: approverId,
      rejectedReason: reason,
      updatedAt: new Date(),
    });
  }

  disburse(): Expense {
    if (this.props.status !== "APPROVED") {
      throw new Error("Only APPROVED expenses can be disbursed");
    }
    return new Expense({ ...this.props, status: "DISBURSED", updatedAt: new Date() });
  }
}
