import { Module } from "@nestjs/common"
import { FinanceController } from "./finance.controller"
import { AlertsController } from "./alerts.controller"
import { PaymentWebhookController } from "./payment-webhook.controller"
import { FinanceService } from "./finance.service"
import { CloseCashboxSessionUseCase } from "./use-cases/close-cashbox-session.use-case"
import { CacheManagerService } from "../../common/cache/cache-manager.service"
import { RealtimeModule } from "../../common/gateway/realtime.module"

@Module({
  imports: [RealtimeModule],
  controllers: [FinanceController, AlertsController, PaymentWebhookController],
  providers: [
    FinanceService,
    CloseCashboxSessionUseCase,
    {
      provide: "FINANCE_CACHE",
      useFactory: (cacheManager: CacheManagerService) => ({
        wrap: <T>(key: string, factory: () => Promise<T>, ttl?: number) =>
          cacheManager.wrap(key, factory, { ttl: ttl ?? 30, prefix: "finance" }),
        invalidate: (pattern: string) => cacheManager.invalidatePattern(pattern),
      }),
      inject: [CacheManagerService],
    },
  ],
  exports: [FinanceService],
})
export class FinanceModule {}
