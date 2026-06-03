import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import { RedisService } from "../redis/redis.service"
import type { Request } from "express"

interface AuthUser {
  id: string
  role: string
  email: string
  name: string
}

const ROLE_LIMITS: Record<string, { points: number; duration: number }> = {
  OWNER: { points: 300, duration: 60 },
  ADMIN: { points: 300, duration: 60 },
  FINANCE: { points: 120, duration: 60 },
  MECHANIC: { points: 60, duration: 60 },
  TRAINEE: { points: 30, duration: 60 },
  CLIENT: { points: 30, duration: 60 },
  ANONYMOUS: { points: 10, duration: 60 },
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>()
    const user = request.user
    const role = user?.role || "ANONYMOUS"

    const limit = ROLE_LIMITS[role] || ROLE_LIMITS.ANONYMOUS
    const identifier = user?.id || request.ip || "unknown"
    const routePath = (request as any).route?.path || request.url.split("?")[0]
    const key = `ratelimit:${identifier}:${routePath}`

    const current = await this.redis.client.incr(key)

    if (current === 1) {
      await this.redis.client.expire(key, limit.duration)
    }

    const remaining = limit.points - current

    const res = request.res
    if (res) {
      res.setHeader("X-RateLimit-Limit", limit.points)
      res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining))
      res.setHeader(
        "X-RateLimit-Reset",
        Math.floor(Date.now() / 1000) + limit.duration,
      )
    }

    if (current > limit.points) {
      throw new HttpException(
        {
          message: "Demasiadas solicitudes. Intente nuevamente en breve.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: limit.duration,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    return true
  }
}
