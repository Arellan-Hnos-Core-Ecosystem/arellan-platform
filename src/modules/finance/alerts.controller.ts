import { Controller, Get, Post, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole, AuditSeverity } from "@prisma/client"
import { PrismaService } from "../../common/prisma/prisma.service"

@ApiTags("Alerts")
@Controller("alerts")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class AlertsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: "Listar alertas del sistema" })
  async getAlerts(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    const take = pageSize ? parseInt(pageSize, 10) : 30
    const skip = page ? (parseInt(page, 10) - 1) * take : 0

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { severity: { in: [AuditSeverity.CRITICAL, AuditSeverity.SECURITY_ALERT] } },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.auditLog.count({
        where: { severity: { in: [AuditSeverity.CRITICAL, AuditSeverity.SECURITY_ALERT] } },
      }),
    ])

    return { data, total, page: parseInt(page || "1", 10), pageSize: take, totalPages: Math.ceil(total / take) }
  }

  @Post(":id/acknowledge")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Reconocer alerta" })
  acknowledgeAlert(@Param("id") id: string) {
    return { success: true, id }
  }
}
