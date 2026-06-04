import { RedisService } from "../redis/redis.service";
export interface CacheOptions {
    ttl: number;
    prefix: string;
    serialize?: (value: unknown) => string;
    deserialize?: (value: string) => unknown;
}
export declare class CacheManagerService {
    private readonly redis;
    private readonly logger;
    constructor(redis: RedisService);
    wrap<T>(key: string, factory: () => Promise<T>, options?: Partial<CacheOptions>): Promise<T>;
    invalidatePattern(pattern: string): Promise<void>;
    invalidate(...keys: string[]): Promise<void>;
}
