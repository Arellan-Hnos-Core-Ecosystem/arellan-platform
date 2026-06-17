import { Injectable, Logger } from "@nestjs/common"
import { RedisService } from "../../../common/redis/redis.service"
import type { ExecutiveSummaryReport } from "@arellan-hnos/business-intelligence-lab"

const EXECUTIVE_SUMMARY_KEY = "analytics:executive-summary"
const TTL_SECONDS = 15 * 60

export type CachedExecutiveSummary = Omit<ExecutiveSummaryReport, "cached">

@Injectable()
export class AnalyticsCacheService {
  private readonly logger = new Logger(AnalyticsCacheService.name)

  constructor(private readonly redis: RedisService) {}

  async getExecutiveSummary(): Promise<CachedExecutiveSummary | null> {
    const raw = await this.redis.get(EXECUTIVE_SUMMARY_KEY)
    return raw ? (JSON.parse(raw) as CachedExecutiveSummary) : null
  }

  async setExecutiveSummary(report: CachedExecutiveSummary): Promise<void> {
    await this.redis.set(EXECUTIVE_SUMMARY_KEY, JSON.stringify(report), TTL_SECONDS)
  }

  async invalidateExecutiveSummary(): Promise<void> {
    await this.redis.del(EXECUTIVE_SUMMARY_KEY)
    this.logger.debug(`Cache invalidado: ${EXECUTIVE_SUMMARY_KEY}`)
  }
}
