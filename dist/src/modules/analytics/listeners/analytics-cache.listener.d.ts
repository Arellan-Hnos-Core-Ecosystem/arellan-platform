import { AnalyticsCacheService } from "../cache/analytics-cache.service";
export declare class AnalyticsCacheListener {
    private readonly cache;
    private readonly logger;
    constructor(cache: AnalyticsCacheService);
    onCashboxClosed(payload: {
        sessionId: string;
    }): Promise<void>;
    onOrderDelivered(payload: {
        orderId: string;
    }): Promise<void>;
}
