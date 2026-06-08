import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq"
import { Job } from "bullmq"
import { Logger } from "@nestjs/common"
import { RealtimeGateway } from "../common/gateway/realtime.gateway"

interface CashboxDiscrepancyJob {
  type: "CASHBOX_DISCREPANCY"
  sessionId: string
  userId: string
  discrepancy: string
  expected: string
  actual: string
  timestamp: string
}

interface ExpenseApprovalJob {
  type: "EXPENSE_APPROVAL_REQUIRED"
  expenseId: string
  requesterId: string
  amount: number
  description: string
  approvalLevel: number
  timestamp: string
}

interface SuspiciousExpenseJob {
  type: "SUSPICIOUS_EXPENSE"
  expenseId: string
  requesterId: string
  amount: number
  category: string
  approvalLevel: number
  timestamp: string
}

interface ExpenseDisbursedJob {
  type: "EXPENSE_DISBURSED"
  expenseId: string
  amount: number
  category: string
  timestamp: string
}

type AlertJob =
  | CashboxDiscrepancyJob
  | ExpenseApprovalJob
  | SuspiciousExpenseJob
  | ExpenseDisbursedJob

@Processor("alert-dispatcher")
export class AlertDispatcherProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertDispatcherProcessor.name)

  constructor(private readonly realtimeGateway: RealtimeGateway) {
    super()
  }

  async process(job: Job<AlertJob, void, string>): Promise<void> {
    const data = job.data

    switch (job.name) {
      case "cashbox-discrepancy": {
        const p = data as CashboxDiscrepancyJob
        this.realtimeGateway.emitAnomalyDetected({
          type: "CASHBOX_DISCREPANCY",
          description: `Discrepancia de caja S/.${p.discrepancy} detectada (esperado: S/.${p.expected}, real: S/.${p.actual})`,
          severity: "CRITICAL",
          sessionId: p.sessionId,
          userId: p.userId,
        })
        this.logger.error(
          `Anomalia de caja: sesion ${p.sessionId}, discrepancia S/.${p.discrepancy}`,
        )
        break
      }

      case "expense-approval-required": {
        const p = data as ExpenseApprovalJob
        this.realtimeGateway.emitApprovalRequested({
          approvalId: p.expenseId,
          type: "EXPENSE",
          amount: p.amount,
          requestedBy: p.requesterId,
        })
        break
      }

      case "suspicious-expense": {
        const p = data as SuspiciousExpenseJob
        this.realtimeGateway.emitSecurityAlert({
          type: "SUSPICIOUS_EXPENSE",
          description: `Gasto sospechoso de S/.${p.amount} en categoria ${p.category} solicitado por ${p.requesterId}`,
          severity: "WARNING",
          userId: p.requesterId,
        })
        break
      }

      case "expense-disbursed": {
        const p = data as ExpenseDisbursedJob
        this.realtimeGateway.emitApprovalResolved({
          approvalId: p.expenseId,
          status: "DISBURSED",
          resolvedBy: "system",
        })
        break
      }

      default:
        this.logger.warn(`AlertDispatcherProcessor: unhandled job name "${job.name}"`)
    }
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Alert dispatch failed for job ${job.id} (${job.name}) after ${job.attemptsMade} attempts: ${error.message}`,
    )
  }
}
