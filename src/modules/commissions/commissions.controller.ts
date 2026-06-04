import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { CommissionsService } from "./commissions.service"
import { CommissionFilterDto, CreateCommissionDto, ApproveCommissionDto } from "./dto/commissions.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Commissions")
@Controller("commissions")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar comisiones", description: "Comisiones con filtros por estado, personal, proveedor y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado paginado de comisiones" })
  findAll(@Query() filters: CommissionFilterDto) { return this.commissionsService.findAll(filters) }

  @Get("personnel/:personnelId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Comisiones por personal" })
  @ApiParam({ name: "personnelId", description: "ID del personal (UUID v4)" })
  @ApiResponse({ status: 200, description: "Comisiones del personal" })
  getByPersonnel(@Param("personnelId") personnelId: string) { return this.commissionsService.getByPersonnel(personnelId) }

  @Get("supplier/:supplierId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Comisiones por proveedor" })
  @ApiParam({ name: "supplierId", description: "ID del proveedor (UUID v4)" })
  @ApiResponse({ status: 200, description: "Comisiones del proveedor" })
  getBySupplier(@Param("supplierId") supplierId: string) { return this.commissionsService.getBySupplier(supplierId) }

  @Post()
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Crear comision (OWNER)", description: "Registra una nueva comision para personal o proveedor. Solo OWNER puede crear comisiones." })
  @ApiResponse({ status: 201, description: "Comision creada en estado PENDING" })
  @ApiResponse({ status: 403, description: "Solo OWNER" })
  create(@Body() dto: CreateCommissionDto, @CurrentUser() user: AuthUser) { return this.commissionsService.create(dto, user.role, user.id) }

  @Post(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Aprobar comision", description: "OWNER o ADMIN aprueban una comision pendiente. Cambia estado a APPROVED." })
  @ApiParam({ name: "id", description: "ID de la comision (UUID v4)" })
  @ApiResponse({ status: 200, description: "Comision aprobada" })
  @ApiResponse({ status: 403, description: "Solo OWNER o ADMIN" })
  @ApiResponse({ status: 404, description: "Comision no encontrada" })
  approve(@Param("id") id: string, @Body() dto: ApproveCommissionDto) { return this.commissionsService.approve(id, dto.approverId) }

  @Post(":id/pay")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Pagar comision", description: "Marca la comision como pagada registrando la fecha de pago. Solo comisiones en estado APPROVED." })
  @ApiParam({ name: "id", description: "ID de la comision (UUID v4)" })
  @ApiResponse({ status: 200, description: "Comision pagada" })
  @ApiResponse({ status: 404, description: "Comision no encontrada" })
  @ApiResponse({ status: 422, description: "La comision debe estar aprobada para pagarse" })
  pay(@Param("id") id: string) { return this.commissionsService.pay(id) }
}
