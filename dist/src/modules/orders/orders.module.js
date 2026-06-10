"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const realtime_module_1 = require("../../common/gateway/realtime.module");
const cache_manager_service_1 = require("../../common/cache/cache-manager.service");
const finance_module_1 = require("../finance/finance.module");
const send_order_quote_use_case_1 = require("./use-cases/send-order-quote.use-case");
const approve_quote_use_case_1 = require("./use-cases/approve-quote.use-case");
const dispatch_parts_to_order_use_case_1 = require("./use-cases/dispatch-parts-to-order.use-case");
const deliver_vehicle_use_case_1 = require("./use-cases/deliver-vehicle.use-case");
const complete_work_order_use_case_1 = require("./use-cases/complete-work-order.use-case");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [realtime_module_1.RealtimeModule, finance_module_1.FinanceModule],
        controllers: [orders_controller_1.OrdersController],
        providers: [
            orders_service_1.OrdersService,
            send_order_quote_use_case_1.SendOrderQuoteUseCase,
            approve_quote_use_case_1.ApproveQuoteUseCase,
            dispatch_parts_to_order_use_case_1.DispatchPartsToOrderUseCase,
            deliver_vehicle_use_case_1.DeliverVehicleUseCase,
            complete_work_order_use_case_1.CompleteWorkOrderUseCase,
            {
                provide: "ORDERS_CACHE",
                useFactory: (cacheManager) => ({
                    wrap: (key, factory, ttl) => cacheManager.wrap(key, factory, { ttl: ttl ?? 60, prefix: "orders" }),
                    invalidate: (pattern) => cacheManager.invalidatePattern(pattern),
                }),
                inject: [cache_manager_service_1.CacheManagerService],
            },
        ],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map