import { Module } from "@nestjs/common"
import { OrdersController } from "./orders.controller"
import { OrdersService } from "./orders.service"
import { RealtimeModule } from "../../common/gateway/realtime.module"
import { CacheManagerService } from "../../common/cache/cache-manager.service"
import { FinanceModule } from "../finance/finance.module"
import { SendOrderQuoteUseCase } from "./use-cases/send-order-quote.use-case"
import { ApproveQuoteUseCase } from "./use-cases/approve-quote.use-case"
import { DispatchPartsToOrderUseCase } from "./use-cases/dispatch-parts-to-order.use-case"
import { DeliverVehicleUseCase } from "./use-cases/deliver-vehicle.use-case"
import { CompleteWorkOrderUseCase } from "./use-cases/complete-work-order.use-case"

@Module({
  imports: [RealtimeModule, FinanceModule],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    SendOrderQuoteUseCase,
    ApproveQuoteUseCase,
    DispatchPartsToOrderUseCase,
    DeliverVehicleUseCase,
    CompleteWorkOrderUseCase,
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
