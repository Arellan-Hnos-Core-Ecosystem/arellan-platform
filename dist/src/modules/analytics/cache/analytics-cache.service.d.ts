import { RedisService } from "../../../common/redis/redis.service";
import type { ExecutiveSummaryReport } from "@arellan-hnos/business-intelligence-lab";
export type CachedExecutiveSummary = Omit<ExecutiveSummaryReport, "cached">;
export declare class AnalyticsCacheService {
    private readonly redis;
    private readonly logger;
    constructor(redis: RedisService);
    getExecutiveSummary(): Promise<CachedExecutiveSummary | null>;
    setExecutiveSummary(report: CachedExecutiveSummary): Promise<void>;
    invalidateExecutiveSummary(): Promise<void>;
}
