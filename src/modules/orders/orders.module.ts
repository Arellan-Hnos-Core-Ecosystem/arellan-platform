import { Module } from "@nestjs/common"
import { OrdersController } from "./orders.controller"
import { OrdersService } from "./orders.service"
import { RealtimeModule } from "../../common/gateway/realtime.module"
import { CacheManagerService } from "../../common/cache/cache-manager.service"

@Module({
  imports: [RealtimeModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    {
      provide: "ORDERS_CACHE",
      useFactory: (cacheManager: CacheManagerService) => ({
        wrap: <T>(key: string, factory: () => Promise<T>, ttl?: number) =>
          cacheManager.wrap(key, factory, { ttl: ttl ?? 60, prefix: "orders" }),
        invalidate: (pattern: string) => cacheManager.invalidatePattern(pattern),
      }),
      inject: [CacheManagerService],
    },
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
