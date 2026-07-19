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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const analytics_cache_service_1 = require("./cache/analytics-cache.service");
const get_executive_summary_use_case_1 = require("./use-cases/get-executive-summary.use-case");
let AnalyticsService = class AnalyticsService {
    cache;
    getExecutiveSummaryUseCase;
    constructor(cache, getExecutiveSummaryUseCase) {
        this.cache = cache;
        this.getExecutiveSummaryUseCase = getExecutiveSummaryUseCase;
    }
    async getExecutiveSummary() {
        const cached = await this.cache.getExecutiveSummary();
        if (cached) {
            return { ...cached, cached: true };
        }
        const fresh = await this.getExecutiveSummaryUseCase.execute();
        await this.cache.setExecutiveSummary(fresh);
        return { ...fresh, cached: false };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_cache_service_1.AnalyticsCacheService,
        get_executive_summary_use_case_1.GetExecutiveSummaryUseCase])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map