import { Expense } from "../entities/expense.entity";

export interface ExpenseFilters {
  status?: string;
  category?: string;
  requestedById?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

export interface IExpenseRepository {
  findById(id: string): Promise<Expense | null>;
  findAll(filters: ExpenseFilters): Promise<{ data: Expense[]; total: number }>;
  findPending(): Promise<Expense[]>;
  save(expense: Expense): Promise<Expense>;
  update(expense: Expense): Promise<Expense>;
}
