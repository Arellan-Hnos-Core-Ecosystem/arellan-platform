import { Module, Global } from "@nestjs/common"
import { BullModule } from "@nestjs/bullmq"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { QueueName } from "./queue-names.enum"

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get("REDIS_HOST", "redis"),
          port: config.get("REDIS_PORT", 6379),
          password: config.get("REDIS_PASSWORD"),
        },
        defaultJobOptions: {
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 500 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QueueName.AUDIT_EVENTS },
      { name: QueueName.NOTIFICATIONS },
      { name: QueueName.INVOICE_GENERATION },
      { name: QueueName.REPORT_BUILDER },
      { name: QueueName.ALERT_DISPATCHER },
      { name: QueueName.PUSH_NOTIFICATIONS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
