import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { AnalyticsCacheService } from "../cache/analytics-cache.service"

@Injectable()
export class AnalyticsCacheListener {
  private readonly logger = new Logger(AnalyticsCacheListener.name)

  constructor(private readonly cache: AnalyticsCacheService) {}

  @OnEvent("cashbox.closed")
  async onCashboxClosed(payload: { sessionId: string }) {
    this.logger.debug(`cashbox.closed (session ${payload.sessionId}) -> invalidando cache de analitica`)
    await this.cache.invalidateExecutiveSummary()
  }

  @OnEvent("order.delivered")
  async onOrderDelivered(payload: { orderId: string }) {
    this.logger.debug(`order.delivered (OT ${payload.orderId}) -> invalidando cache de analitica`)
    await this.cache.invalidateExecutiveSummary()
  }
}
