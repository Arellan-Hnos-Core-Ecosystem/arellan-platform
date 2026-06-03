import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { APP_GUARD } from "@nestjs/core"
import { PrismaModule } from "./common/prisma/prisma.module"
import { RedisModule } from "./common/redis/redis.module"
import { CryptoModule } from "./common/crypto/crypto.module"
import { CacheModule } from "./common/cache/cache.module"
import { QueueModule } from "./queues/queue.module"
import { WorkersModule } from "./workers/workers.module"
import { GatewaysModule } from "./gateways/gateways.module"
import { RealtimeModule } from "./common/gateway/realtime.module"
import { AuthModule } from "./modules/auth/auth.module"
import { OrdersModule } from "./modules/orders/orders.module"
import { FinanceModule } from "./modules/finance/finance.module"
import { InventoryModule } from "./modules/inventory/inventory.module"
import { ClientsModule } from "./modules/clients/clients.module"
import { VehiclesModule } from "./modules/vehicles/vehicles.module"
import { PersonnelModule } from "./modules/personnel/personnel.module"
import { AttendanceModule } from "./modules/attendance/attendance.module"
import { PurchasesModule } from "./modules/purchases/purchases.module"
import { CommissionsModule } from "./modules/commissions/commissions.module"
import { QuotesModule } from "./modules/quotes/quotes.module"
import { InvoicesModule } from "./modules/invoices/invoices.module"
import { PaymentsModule } from "./modules/payments/payments.module"
import { SettingsModule } from "./modules/settings/settings.module"
import { AuditModule } from "./modules/audit/audit.module"
import { HealthModule } from "./common/health/health.module"
import { PublicModule } from "./common/public/public.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    CryptoModule,
    CacheModule,
    QueueModule,
    WorkersModule,
    GatewaysModule,
    RealtimeModule,
    AuthModule,
    OrdersModule,
    FinanceModule,
    InventoryModule,
    ClientsModule,
    VehiclesModule,
    PersonnelModule,
    AttendanceModule,
    PurchasesModule,
    CommissionsModule,
    QuotesModule,
    InvoicesModule,
    PaymentsModule,
    SettingsModule,
    AuditModule,
    HealthModule,
    PublicModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
