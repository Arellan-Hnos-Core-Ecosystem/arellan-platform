import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { AuditService } from "./audit.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { MfaRequiredGuard } from "../../common/guards/mfa-required.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"
import { AuditFilterDto } from "./dto/audit.dto"

@ApiTags("Audit")
@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth("access-token")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: "Consultar logs de auditoria",
    description: "Listado paginado de logs con filtros por usuario, accion, entidad y rango de fechas. Cada log incluye hash SHA-256 inmutable generado por IntegrityHashService para prevenir manipulaciones. Requiere MFA.",
  })
  @ApiResponse({ status: 200, description: "Logs de auditoria paginados" })
  @ApiResponse({ status: 401, description: "JWT invalido o MFA no verificado" })
  @ApiResponse({ status: 403, description: "Solo ADMIN u OWNER" })
  findAll(@Query() filters: AuditFilterDto) { return this.auditService.findAll(filters) }

  @Get("user/:userId")
  @ApiOperation({ summary: "Logs de auditoria por usuario", description: "Todas las acciones registradas para un usuario especifico." })
  @ApiParam({ name: "userId", description: "ID del usuario (UUID v4)" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiResponse({ status: 200, description: "Logs del usuario" })
  getByUser(@Param("userId") userId: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.auditService.getByUser(userId, limit ? parseInt(limit) : undefined, cursor)
  }

  @Get("entity/:entity/:entityId")
  @ApiOperation({ summary: "Logs por entidad", description: "Auditoria de todas las mutaciones sobre una entidad especifica (ej. orders, finance, inventory)." })
  @ApiParam({ name: "entity", description: "Nombre de la entidad", example: "orders" })
  @ApiParam({ name: "entityId", description: "ID de la entidad (UUID v4)" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiResponse({ status: 200, description: "Logs de la entidad" })
  getByEntity(@Param("entity") entity: string, @Param("entityId") entityId: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.auditService.getByEntity(entity, entityId, limit ? parseInt(limit) : undefined, cursor)
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalle de un log de auditoria" })
  @ApiParam({ name: "id", description: "ID del log (UUID v4)" })
  @ApiResponse({ status: 200, description: "Detalle del log con beforeState/afterState" })
  @ApiResponse({ status: 404, description: "Log no encontrado" })
  findOne(@Param("id") id: string) { return this.auditService.findOne(id) }
}
