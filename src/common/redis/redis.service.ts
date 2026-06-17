import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  readonly client: Redis

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get("REDIS_URL")
    const connectionUrl = redisUrl
      || `redis://${this.config.get("REDIS_HOST") || "redis"}:${this.config.get("REDIS_PORT") || "6379"}`

    this.client = new Redis(connectionUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        if (times > 20) {
          this.logger.error(`Redis unreachable after ${times} retries, giving up`)
          return null
        }
        const delay = Math.min(times * 200, 5000)
        this.logger.warn(`Redis connection retry ${times} in ${delay}ms`)
        return delay
      },
    })
  }

  async onModuleInit() {
    this.logger.log("Connected to Redis")
  }

  async onModuleDestroy() {
    await this.client.quit()
    this.logger.log("Disconnected from Redis")
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, "EX", ttl)
    } else {
      await this.client.set(key, value)
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }
}
