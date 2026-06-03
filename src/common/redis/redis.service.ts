import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import Redis from "ioredis"

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  readonly client: Redis

  constructor(private config: ConfigService) {
    this.client = new Redis(this.config.get("REDIS_URL", "redis://localhost:6379"), {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
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
