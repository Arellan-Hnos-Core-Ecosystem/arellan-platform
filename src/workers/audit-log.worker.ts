import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq"
import { Job } from "bullmq"
import { Logger } from "@nestjs/common"
import { PrismaService } from "../common/prisma/prisma.service"

interface AuditJobPayload {
  userId: string
  userName: string
  role: string
  action: string
  entity: string
  entityId: string | null
  beforeState: Record<string, unknown> | null
  afterState: Record<string, unknown> | null
  integrityHash: string
  ipAddress: string
  userAgent: string | null
  correlationId: string
  metadata: Record<string, unknown>
}

@Processor("audit-events")
export class AuditLogWorker extends WorkerHost {
  private readonly logger = new Logger(AuditLogWorker.name)

  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async process(job: Job<AuditJobPayload, void, string>): Promise<void> {
    const data = job.data

    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userName: data.userName,
          role: data.role,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          beforeState: data.beforeState as any,
          afterState: data.afterState as any,
          integrityHash: data.integrityHash,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: data.metadata as any,
        },
      })
    } catch (error) {
      this.logger.error(
        `Failed to persist audit log for job ${job.id}: ${(error as Error).message}`,
      )
      throw error
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.debug(`Audit log ${job.id} persisted successfully`)
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Audit log ${job.id} FAILED after ${job.attemptsMade} attempts: ${error.message}`,
    )
  }
}
