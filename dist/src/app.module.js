"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./common/prisma/prisma.module");
const redis_module_1 = require("./common/redis/redis.module");
const crypto_module_1 = require("./common/crypto/crypto.module");
const cache_module_1 = require("./common/cache/cache.module");
const queue_module_1 = require("./queues/queue.module");
const workers_module_1 = require("./workers/workers.module");
const gateways_module_1 = require("./gateways/gateways.module");
const realtime_module_1 = require("./common/gateway/realtime.module");
const auth_module_1 = require("./modules/auth/auth.module");
const orders_module_1 = require("./modules/orders/orders.module");
const finance_module_1 = require("./modules/finance/finance.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const clients_module_1 = require("./modules/clients/clients.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const personnel_module_1 = require("./modules/personnel/personnel.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
const commissions_module_1 = require("./modules/commissions/commissions.module");
const quotes_module_1 = require("./modules/quotes/quotes.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const payments_module_1 = require("./modules/payments/payments.module");
const settings_module_1 = require("./modules/settings/settings.module");
const audit_module_1 = require("./modules/audit/audit.module");
const health_module_1 = require("./common/health/health.module");
const public_module_1 = require("./common/public/public.module");
const anti_fraud_module_1 = require("./common/anti-fraud/anti-fraud.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const data_masking_interceptor_1 = require("./common/interceptors/data-masking.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            crypto_module_1.CryptoModule,
            cache_module_1.CacheModule,
            queue_module_1.QueueModule,
            workers_module_1.WorkersModule,
            gateways_module_1.GatewaysModule,
            realtime_module_1.RealtimeModule,
            auth_module_1.AuthModule,
            orders_module_1.OrdersModule,
            finance_module_1.FinanceModule,
            inventory_module_1.InventoryModule,
            clients_module_1.ClientsModule,
            vehicles_module_1.VehiclesModule,
            personnel_module_1.PersonnelModule,
            attendance_module_1.AttendanceModule,
            purchases_module_1.PurchasesModule,
            commissions_module_1.CommissionsModule,
            quotes_module_1.QuotesModule,
            invoices_module_1.InvoicesModule,
            payments_module_1.PaymentsModule,
            settings_module_1.SettingsModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
            public_module_1.PublicModule,
            anti_fraud_module_1.AntiFraudModule,
            dashboard_module_1.DashboardModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: audit_interceptor_1.AuditInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: data_masking_interceptor_1.DataMaskingInterceptor },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map