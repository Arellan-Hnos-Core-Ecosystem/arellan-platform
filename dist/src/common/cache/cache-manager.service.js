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
var CacheManagerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManagerService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const defaults = {
    ttl: 300,
    prefix: "cache",
    serialize: JSON.stringify,
    deserialize: JSON.parse,
};
let CacheManagerService = CacheManagerService_1 = class CacheManagerService {
    redis;
    logger = new common_1.Logger(CacheManagerService_1.name);
    constructor(redis) {
        this.redis = redis;
    }
    async wrap(key, factory, options) {
        const opts = { ...defaults, ...options };
        const fullKey = `${opts.prefix}:${key}`;
        try {
            const cached = await this.redis.get(fullKey);
            if (cached !== null) {
                return opts.deserialize(cached);
            }
        }
        catch (err) {
            this.logger.warn(`Cache read failed for ${fullKey}: ${err.message}`);
        }
        const value = await factory();
        try {
            await this.redis.set(fullKey, opts.serialize(value), opts.ttl);
        }
        catch (err) {
            this.logger.warn(`Cache write failed for ${fullKey}: ${err.message}`);
        }
        return value;
    }
    async invalidatePattern(pattern) {
        try {
            let cursor = "0";
            do {
                const [nextCursor, keys] = await this.redis.client.scan(cursor, "MATCH", pattern, "COUNT", 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    await this.redis.client.del(...keys);
                }
            } while (cursor !== "0");
        }
        catch (err) {
            this.logger.error(`Cache invalidation failed: ${err.message}`);
        }
    }
    async invalidate(...keys) {
        if (keys.length === 0)
            return;
        try {
            await this.redis.client.del(...keys);
        }
        catch (err) {
            this.logger.error(`Cache delete failed: ${err.message}`);
        }
    }
};
exports.CacheManagerService = CacheManagerService;
exports.CacheManagerService = CacheManagerService = CacheManagerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], CacheManagerService);
//# sourceMappingURL=cache-manager.service.js.map