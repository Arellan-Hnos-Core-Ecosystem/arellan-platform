import { Controller, Get } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { PrismaService } from "../prisma/prisma.service"
import { RedisService } from "../redis/redis.service"

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  @Get()
  @ApiOperation({
    summary: "Health Check de servicios",
    description: "Verifica el estado de PostgreSQL (SELECT 1) y Redis (PING). Retorna 'ok' o 'error' para cada servicio con timestamp.",
  })
  @ApiResponse({ status: 200, description: "Estado de los servicios: postgres, redis, timestamp" })
  @ApiResponse({ status: 503, description: "Uno o mas servicios no responden" })
  async check() {
    const checks: Record<string, string> = { postgres: "ok", redis: "ok", timestamp: new Date().toISOString() }
    try { await this.prisma.$queryRaw`SELECT 1` } catch { checks.postgres = "error" }
    try { await this.redis.client.ping() } catch { checks.redis = "error" }
    return checks
  }
}
