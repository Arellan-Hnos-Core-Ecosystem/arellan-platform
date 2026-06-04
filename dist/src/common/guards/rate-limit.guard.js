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
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const ROLE_LIMITS = {
    OWNER: { points: 300, duration: 60 },
    ADMIN: { points: 300, duration: 60 },
    FINANCE: { points: 120, duration: 60 },
    MECHANIC: { points: 60, duration: 60 },
    TRAINEE: { points: 30, duration: 60 },
    CLIENT: { points: 30, duration: 60 },
    ANONYMOUS: { points: 10, duration: 60 },
};
let RateLimitGuard = class RateLimitGuard {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const role = user?.role || "ANONYMOUS";
        const limit = ROLE_LIMITS[role] || ROLE_LIMITS.ANONYMOUS;
        const identifier = user?.id || request.ip || "unknown";
        const routePath = request.route?.path || request.url.split("?")[0];
        const key = `ratelimit:${identifier}:${routePath}`;
        const current = await this.redis.client.incr(key);
        if (current === 1) {
            await this.redis.client.expire(key, limit.duration);
        }
        const remaining = limit.points - current;
        const res = request.res;
        if (res) {
            res.setHeader("X-RateLimit-Limit", limit.points);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
            res.setHeader("X-RateLimit-Reset", Math.floor(Date.now() / 1000) + limit.duration);
        }
        if (current > limit.points) {
            throw new common_1.HttpException({
                message: "Demasiadas solicitudes. Intente nuevamente en breve.",
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: limit.duration,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map