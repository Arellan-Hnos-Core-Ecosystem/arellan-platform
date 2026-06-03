import { Injectable, Logger } from "@nestjs/common"
import { RedisService } from "../redis/redis.service"

export interface CacheOptions {
  ttl: number
  prefix: string
  serialize?: (value: unknown) => string
  deserialize?: (value: string) => unknown
}

const defaults: CacheOptions = {
  ttl: 300,
  prefix: "cache",
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}

@Injectable()
export class CacheManagerService {
  private readonly logger = new Logger(CacheManagerService.name)

  constructor(private readonly redis: RedisService) {}

  async wrap<T>(
    key: string,
    factory: () => Promise<T>,
    options?: Partial<CacheOptions>,
  ): Promise<T> {
    const opts = { ...defaults, ...options }
    const fullKey = `${opts.prefix}:${key}`

    try {
      const cached = await this.redis.get(fullKey)
      if (cached !== null) {
        return opts.deserialize!(cached) as T
      }
    } catch (err) {
      this.logger.warn(`Cache read failed for ${fullKey}: ${(err as Error).message}`)
    }

    const value = await factory()

    try {
      await this.redis.set(fullKey, opts.serialize!(value), opts.ttl)
    } catch (err) {
      this.logger.warn(`Cache write failed for ${fullKey}: ${(err as Error).message}`)
    }

    return value
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = "0"
      do {
        const [nextCursor, keys] = await this.redis.client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        )
        cursor = nextCursor
        if (keys.length > 0) {
          await this.redis.client.del(...keys)
        }
      } while (cursor !== "0")
    } catch (err) {
      this.logger.error(`Cache invalidation failed: ${(err as Error).message}`)
    }
  }

  async invalidate(...keys: string[]): Promise<void> {
    if (keys.length === 0) return
    try {
      await this.redis.client.del(...keys)
    } catch (err) {
      this.logger.error(`Cache delete failed: ${(err as Error).message}`)
    }
  }
}
