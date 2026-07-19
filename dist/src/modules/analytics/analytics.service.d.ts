import { AnalyticsCacheService } from "./cache/analytics-cache.service";
import { GetExecutiveSummaryUseCase } from "./use-cases/get-executive-summary.use-case";
import type { ExecutiveSummaryReport } from "@arellan-hnos/business-intelligence-lab";
export declare class AnalyticsService {
    private readonly cache;
    private readonly getExecutiveSummaryUseCase;
    constructor(cache: AnalyticsCacheService, getExecutiveSummaryUseCase: GetExecutiveSummaryUseCase);
    getExecutiveSummary(): Promise<ExecutiveSummaryReport>;
}
