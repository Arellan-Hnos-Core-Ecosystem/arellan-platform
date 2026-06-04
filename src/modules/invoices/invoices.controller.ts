import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { InvoicesService } from "./invoices.service"
import { InvoiceFilterDto, CancelInvoiceDto } from "./dto/invoices.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Invoices")
@Controller("invoices")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar facturas", description: "Listado paginado con filtros por estado, cliente, busqueda y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado paginado de facturas" })
  findAll(@Query() filters: InvoiceFilterDto) { return this.invoicesService.findAll(filters) }

  @Get("overdue")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Facturas vencidas", description: "Facturas con estado OVERDUE (fecha de vencimiento superada sin pago completo)." })
  @ApiResponse({ status: 200, description: "Lista de facturas vencidas" })
  getOverdue() { return this.invoicesService.getOverdue() }

  @Get("client/:clientId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Facturas por cliente" })
  @ApiParam({ name: "clientId", description: "ID del cliente (UUID v4)" })
  @ApiResponse({ status: 200, description: "Facturas del cliente" })
  getByClient(@Param("clientId") clientId: string) { return this.invoicesService.getByClient(clientId) }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Detalle de factura", description: "Factura completa con pagos asociados y datos del cliente." })
  @ApiParam({ name: "id", description: "ID de la factura (UUID v4)" })
  @ApiResponse({ status: 200, description: "Factura detallada" })
  @ApiResponse({ status: 404, description: "Factura no encontrada" })
  findOne(@Param("id") id: string) { return this.invoicesService.findOne(id) }

  @Post("from-order/:orderId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Generar factura desde OT", description: "Crea una factura automaticamente con los datos de la OT: repuestos, mano de obra, descuentos e impuestos." })
  @ApiParam({ name: "orderId", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 201, description: "Factura generada desde OT" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  createFromOrder(@Param("orderId") orderId: string, @CurrentUser() user: AuthUser) { return this.invoicesService.createFromOrder(orderId, user.id) }

  @Post(":id/issue")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Emitir factura", description: "Cambia el estado de DRAFT a ISSUED y registra la fecha de emision." })
  @ApiParam({ name: "id", description: "ID de la factura (UUID v4)" })
  @ApiResponse({ status: 200, description: "Factura emitida" })
  @ApiResponse({ status: 404, description: "Factura no encontrada" })
  @ApiResponse({ status: 422, description: "La factura ya fue emitida o cancelada" })
  issue(@Param("id") id: string, @CurrentUser() user: AuthUser) { return this.invoicesService.issue(id, user.id) }

  @Post(":id/cancel")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Anular factura", description: "Cancela una factura con motivo. Solo OWNER o ADMIN." })
  @ApiParam({ name: "id", description: "ID de la factura (UUID v4)" })
  @ApiResponse({ status: 200, description: "Factura anulada" })
  @ApiResponse({ status: 404, description: "Factura no encontrada" })
  cancel(@Param("id") id: string, @Body() dto: CancelInvoiceDto) { return this.invoicesService.cancel(id, dto.reason) }
}
