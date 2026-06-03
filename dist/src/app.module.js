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
const auth_module_1 = require("./modules/auth/auth.module");
const orders_module_1 = require("./modules/orders/orders.module");
const finance_module_1 = require("./modules/finance/finance.module");
const inventory_module_1 = require("./modules/inventory/inventory.module");
const clients_module_1 = require("./modules/clients/clients.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const personnel_module_1 = require("./modules/personnel/personnel.module");
const audit_module_1 = require("./modules/audit/audit.module");
const health_module_1 = require("./common/health/health.module");
const public_module_1 = require("./common/public/public.module");
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
            auth_module_1.AuthModule,
            orders_module_1.OrdersModule,
            finance_module_1.FinanceModule,
            inventory_module_1.InventoryModule,
            clients_module_1.ClientsModule,
            vehicles_module_1.VehiclesModule,
            personnel_module_1.PersonnelModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
            public_module_1.PublicModule,
        ],
        providers: [{ provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard }],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map