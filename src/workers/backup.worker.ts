import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "../common/prisma/prisma.service"

@Injectable()
export class BackupWorker {
  private readonly logger = new Logger(BackupWorker.name)

  constructor(private readonly prisma: PrismaService) {}

  @Cron("0 2 * * *")
  async dailyBackup() {
    this.logger.log("Daily backup job triggered")
    await this.prisma.auditLog.create({
      data: {
        userId: "system",
        userName: "BackupWorker",
        role: "OWNER" as any,
        action: "BACKUP_TRIGGERED",
        entity: "System",
        severity: "INFO",
        ipAddress: "system",
        metadata: { timestamp: new Date().toISOString(), type: "DAILY_AUTOMATIC" } as any,
      },
    })
    this.logger.log("Backup log registered. Cloud provider handles actual backup.")
  }
}
