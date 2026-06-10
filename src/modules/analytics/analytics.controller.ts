import { Controller, Get, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"
import { AnalyticsService } from "./analytics.service"

@ApiTags("Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("summary")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: "Reporte ejecutivo de BI gerencial",
    description: "Tiempo promedio de reparacion por mecanico (RECEIVED->READY), tasa de conversion de cotizaciones, valoracion real de inventario (costo blended) y margen neto de caja chica. Cacheado en Redis 15 min, invalidado al cerrar caja o entregar un vehiculo.",
  })
  @ApiResponse({ status: 200, description: "Reporte ejecutivo (cached indica si vino de Redis)" })
  @ApiResponse({ status: 401, description: "JWT invalido o expirado" })
  @ApiResponse({ status: 403, description: "Solo OWNER/ADMIN" })
  getSummary() {
    return this.analyticsService.getExecutiveSummary()
  }
}
