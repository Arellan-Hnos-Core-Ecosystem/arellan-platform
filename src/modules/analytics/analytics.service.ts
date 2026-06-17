import { Injectable } from "@nestjs/common"
import { AnalyticsCacheService } from "./cache/analytics-cache.service"
import { GetExecutiveSummaryUseCase } from "./use-cases/get-executive-summary.use-case"
import type { ExecutiveSummaryReport } from "@arellan-hnos/business-intelligence-lab"

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly cache: AnalyticsCacheService,
    private readonly getExecutiveSummaryUseCase: GetExecutiveSummaryUseCase,
  ) {}

  async getExecutiveSummary(): Promise<ExecutiveSummaryReport> {
    const cached = await this.cache.getExecutiveSummary()
    if (cached) {
      return { ...cached, cached: true }
    }

    const fresh = await this.getExecutiveSummaryUseCase.execute()
    await this.cache.setExecutiveSummary(fresh)
    return { ...fresh, cached: false }
  }
}
