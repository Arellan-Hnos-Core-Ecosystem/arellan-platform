import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core"
import { PrismaModule } from "./common/prisma/prisma.module"
import { RedisModule } from "./common/redis/redis.module"
import { CryptoModule } from "./common/crypto/crypto.module"
import { CacheModule } from "./common/cache/cache.module"
import { QueueModule } from "./queues/queue.module"
import { WorkersModule } from "./workers/workers.module"
import { GatewaysModule } from "./gateways/gateways.module"
import { RealtimeModule } from "./common/gateway/realtime.module"
import { IotBridgeModule } from "./common/iot-bridge/iot-bridge.module"
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
import { AntiFraudModule } from "./common/anti-fraud/anti-fraud.module"
import { DashboardModule } from "./modules/dashboard/dashboard.module"
import { AnalyticsModule } from "./modules/analytics/analytics.module"
import { AuditInterceptor } from "./common/interceptors/audit.interceptor"
import { DataMaskingInterceptor } from "./common/interceptors/data-masking.interceptor"
import { AntiFraudInterceptor } from "./common/anti-fraud/anti-fraud.interceptor"
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RedisModule,
    CryptoModule,
    CacheModule,
    QueueModule,
    WorkersModule,
    GatewaysModule,
    RealtimeModule,
    IotBridgeModule,
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
    AntiFraudModule,
    DashboardModule,
    AnalyticsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // SEC-01: interceptor anti-fraude global (corre tras la autenticación).
    { provide: APP_INTERCEPTOR, useClass: AntiFraudInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: DataMaskingInterceptor },
  ],
})
export class AppModule {}
