import { Module } from "@nestjs/common"
import { PurchasesController } from "./purchases.controller"
import { PurchasesService } from "./purchases.service"
import { CacheManagerService } from "../../common/cache/cache-manager.service"

@Module({
  controllers: [PurchasesController],
  providers: [
    PurchasesService,
    {
      provide: "PURCHASES_CACHE",
      useFactory: (cacheManager: CacheManagerService) => ({
        wrap: <T>(key: string, factory: () => Promise<T>, ttl?: number) =>
          cacheManager.wrap(key, factory, { ttl: ttl ?? 120, prefix: "purchases" }),
        invalidate: (pattern: string) => cacheManager.invalidatePattern(pattern),
      }),
      inject: [CacheManagerService],
    },
  ],
  exports: [PurchasesService],
})
export class PurchasesModule {}
