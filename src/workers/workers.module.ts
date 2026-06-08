import { Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { AuditLogWorker } from "./audit-log.worker"
import { InventoryAlertWorker } from "./inventory-alert.worker"
import { CashboxReportWorker } from "./cashbox-report.worker"
import { AuditAnomalyWorker } from "./audit-anomaly.worker"
import { BackupWorker } from "./backup.worker"
import { MonthlyDiscrepancyWorker } from "./monthly-discrepancy.worker"
import { AlertDispatcherProcessor } from "./alert-dispatcher.processor"
import { PrismaModule } from "../common/prisma/prisma.module"

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  providers: [
    AuditLogWorker,
    InventoryAlertWorker,
    CashboxReportWorker,
    AuditAnomalyWorker,
    BackupWorker,
    MonthlyDiscrepancyWorker,
    AlertDispatcherProcessor,
  ],
  exports: [ScheduleModule],
})
export class WorkersModule {}
