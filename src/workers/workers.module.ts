import { Module } from "@nestjs/common"
import { AuditLogWorker } from "./audit-log.worker"
import { PrismaModule } from "../common/prisma/prisma.module"

@Module({
  imports: [PrismaModule],
  providers: [AuditLogWorker],
})
export class WorkersModule {}
