import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { PaymentsService } from "./payments.service"
import { PaymentFilterDto, CreatePaymentDto, VerifyPaymentDto } from "./dto/payments.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole, PaymentMethod } from "@prisma/client"

@ApiTags("Payments")
@Controller("payments")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar pagos", description: "Listado paginado de todos los pagos con filtros por metodo, orden, factura y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado paginado de pagos" })
  findAll(@Query() filters: PaymentFilterDto) { return this.paymentsService.findAll(filters) }

  @Get("today")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Resumen de pagos del dia", description: "Total recaudado hoy agrupado por metodo de pago." })
  @ApiResponse({ status: 200, description: "Resumen de pagos del dia" })
  getTodaySummary() { return this.paymentsService.getTodaySummary() }

  @Get("method")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Pagos por metodo", description: "Filtra pagos por metodo (YAPE, PLIN, CASH, TRANSFER, CARD) en un rango de fechas." })
  @ApiQuery({ name: "method", enum: PaymentMethod, example: "YAPE" })
  @ApiQuery({ name: "from", description: "Fecha inicio ISO", example: "2026-06-01" })
  @ApiQuery({ name: "to", description: "Fecha fin ISO", example: "2026-06-30" })
  @ApiResponse({ status: 200, description: "Pagos filtrados por metodo" })
  getByMethod(@Query("method") method: PaymentMethod, @Query("from") from: string, @Query("to") to: string) { return this.paymentsService.getByMethod(method, from, to) }

  @Get("order/:orderId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Pagos de una orden", description: "Todos los pagos asociados a una OT especifica." })
  @ApiParam({ name: "orderId", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "Pagos de la OT" })
  getByOrder(@Param("orderId") orderId: string) { return this.paymentsService.getByOrder(orderId) }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Registrar pago",
    description: "Registra un pago asociado a una OT y/o factura. Si isPersonalYape=true, dispara alerta antifraude via WebSocket. Valida que el monto coincida con el saldo pendiente de la OT.",
  })
  @ApiResponse({ status: 201, description: "Pago registrado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 422, description: "Pago Yape a cuenta personal detectado" })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) { return this.paymentsService.create(dto, user.id) }

  @Post(":id/verify")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Verificar pago (doble control)", description: "Un segundo usuario verifica y confirma un pago. Requerido para pagos Yape/Plin como medida antifraude." })
  @ApiParam({ name: "id", description: "ID del pago (UUID v4)" })
  @ApiResponse({ status: 200, description: "Pago verificado" })
  @ApiResponse({ status: 404, description: "Pago no encontrado" })
  verify(@Param("id") id: string, @Body() dto: VerifyPaymentDto) { return this.paymentsService.verify(id, dto.verifierId) }
}
