"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsCacheListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCacheListener = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const analytics_cache_service_1 = require("../cache/analytics-cache.service");
let AnalyticsCacheListener = AnalyticsCacheListener_1 = class AnalyticsCacheListener {
    cache;
    logger = new common_1.Logger(AnalyticsCacheListener_1.name);
    constructor(cache) {
        this.cache = cache;
    }
    async onCashboxClosed(payload) {
        this.logger.debug(`cashbox.closed (session ${payload.sessionId}) -> invalidando cache de analitica`);
        await this.cache.invalidateExecutiveSummary();
    }
    async onOrderDelivered(payload) {
        this.logger.debug(`order.delivered (OT ${payload.orderId}) -> invalidando cache de analitica`);
        await this.cache.invalidateExecutiveSummary();
    }
};
exports.AnalyticsCacheListener = AnalyticsCacheListener;
__decorate([
    (0, event_emitter_1.OnEvent)("cashbox.closed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCacheListener.prototype, "onCashboxClosed", null);
__decorate([
    (0, event_emitter_1.OnEvent)("order.delivered"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnalyticsCacheListener.prototype, "onOrderDelivered", null);
exports.AnalyticsCacheListener = AnalyticsCacheListener = AnalyticsCacheListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_cache_service_1.AnalyticsCacheService])
], AnalyticsCacheListener);
//# sourceMappingURL=analytics-cache.listener.js.map