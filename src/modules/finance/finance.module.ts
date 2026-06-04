import { Module } from "@nestjs/common"
import { FinanceController } from "./finance.controller"
import { FinanceService } from "./finance.service"
import { CacheManagerService } from "../../common/cache/cache-manager.service"

@Module({
  controllers: [FinanceController],
  providers: [
    FinanceService,
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
