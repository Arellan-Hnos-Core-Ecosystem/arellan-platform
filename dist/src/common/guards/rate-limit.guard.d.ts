import { CanActivate, ExecutionContext } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";
export declare class RateLimitGuard implements CanActivate {
    private readonly redis;
    constructor(redis: RedisService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
