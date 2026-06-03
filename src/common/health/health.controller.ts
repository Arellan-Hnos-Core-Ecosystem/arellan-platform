import { Controller, Get } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { RedisService } from "../redis/redis.service"

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async check() {
    const checks = {
      postgres: "ok" as string,
      redis: "ok" as string,
      timestamp: new Date().toISOString(),
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`
    } catch {
      checks.postgres = "error"
    }

    try {
      await this.redis.client.ping()
    } catch {
      checks.redis = "error"
    }

    return checks
  }
}
