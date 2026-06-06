import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"
import { DashboardService } from "./dashboard.service"

@ApiTags("Dashboard")
@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({
    summary: "Resumen ejecutivo del dashboard",
    description: "KPIs principales: ingresos de hoy vs ayer, ordenes activas, aprobaciones pendientes, estado de caja.",
  })
  @ApiResponse({ status: 200, description: "Resumen ejecutivo" })
  getSummary() {
    return this.dashboardService.getExecutiveSummary()
  }

  @Get("pending-approvals-count")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiOperation({ summary: "Conteo de aprobaciones pendientes" })
  getPendingApprovalsCount() {
    return this.dashboardService.getPendingApprovalsCount()
  }
}
