"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesModule = void 0;
const common_1 = require("@nestjs/common");
const purchases_controller_1 = require("./purchases.controller");
const purchases_service_1 = require("./purchases.service");
const cache_manager_service_1 = require("../../common/cache/cache-manager.service");
let PurchasesModule = class PurchasesModule {
};
exports.PurchasesModule = PurchasesModule;
exports.PurchasesModule = PurchasesModule = __decorate([
    (0, common_1.Module)({
        controllers: [purchases_controller_1.PurchasesController],
        providers: [
            purchases_service_1.PurchasesService,
            {
                provide: "PURCHASES_CACHE",
                useFactory: (cacheManager) => ({
                    wrap: (key, factory, ttl) => cacheManager.wrap(key, factory, { ttl: ttl ?? 120, prefix: "purchases" }),
                    invalidate: (pattern) => cacheManager.invalidatePattern(pattern),
                }),
                inject: [cache_manager_service_1.CacheManagerService],
            },
        ],
        exports: [purchases_service_1.PurchasesService],
    })
], PurchasesModule);
//# sourceMappingURL=purchases.module.js.map