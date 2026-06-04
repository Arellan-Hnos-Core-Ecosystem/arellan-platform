import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { QuotesService } from "./quotes.service"
import { QuoteFilterDto, CreateQuoteDto, RejectQuoteDto } from "./dto/quotes.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Quotes")
@Controller("quotes")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar cotizaciones", description: "Listado paginado con filtros por estado, cliente y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado paginado de cotizaciones" })
  findAll(@Query() filters: QuoteFilterDto) { return this.quotesService.findAll(filters) }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Detalle de cotizacion" })
  @ApiParam({ name: "id", description: "ID de la cotizacion (UUID v4)" })
  @ApiResponse({ status: 200, description: "Cotizacion detallada" })
  @ApiResponse({ status: 404, description: "Cotizacion no encontrada" })
  findOne(@Param("id") id: string) { return this.quotesService.findOne(id) }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Crear cotizacion", description: "Genera una cotizacion en estado DRAFT con numero autoincremental. Opcionalmente vinculada a una OT." })
  @ApiResponse({ status: 201, description: "Cotizacion creada" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: AuthUser) { return this.quotesService.create(dto, user.id) }

  @Post(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Aprobar cotizacion" })
  @ApiParam({ name: "id", description: "ID de la cotizacion (UUID v4)" })
  @ApiResponse({ status: 200, description: "Cotizacion aprobada" })
  @ApiResponse({ status: 404, description: "Cotizacion no encontrada" })
  approve(@Param("id") id: string) { return this.quotesService.approve(id) }

  @Post(":id/reject")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Rechazar cotizacion" })
  @ApiParam({ name: "id", description: "ID de la cotizacion (UUID v4)" })
  @ApiResponse({ status: 200, description: "Cotizacion rechazada" })
  reject(@Param("id") id: string, @Body() dto: RejectQuoteDto) { return this.quotesService.reject(id, dto.reason) }

  @Post(":id/convert")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Convertir cotizacion a OT", description: "Convierte una cotizacion aprobada en una Orden de Trabajo activa. Transfiere datos del cliente y crea la OT en estado RECEIVED." })
  @ApiParam({ name: "id", description: "ID de la cotizacion (UUID v4)" })
  @ApiResponse({ status: 200, description: "OT creada desde cotizacion" })
  @ApiResponse({ status: 404, description: "Cotizacion no encontrada" })
  @ApiResponse({ status: 422, description: "Cotizacion debe estar aprobada para convertir" })
  convertToOrder(@Param("id") id: string, @CurrentUser() user: AuthUser) { return this.quotesService.convertToOrder(id, user.id) }
}
