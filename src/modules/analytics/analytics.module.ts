import { Module } from "@nestjs/common"
import { AnalyticsController } from "./analytics.controller"
import { AnalyticsService } from "./analytics.service"
import { GetExecutiveSummaryUseCase } from "./use-cases/get-executive-summary.use-case"
import { AnalyticsCacheService } from "./cache/analytics-cache.service"
import { AnalyticsCacheListener } from "./listeners/analytics-cache.listener"

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, GetExecutiveSummaryUseCase, AnalyticsCacheService, AnalyticsCacheListener],
})
export class AnalyticsModule {}
