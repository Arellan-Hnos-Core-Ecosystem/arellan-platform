import { Controller, Post, Get, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { FinanceService } from "./finance.service"
import { AuthUser } from "../auth/auth.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { MfaRequiredGuard } from "../../common/guards/mfa-required.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole } from "@prisma/client"
import { OpenCashboxDto, CloseCashboxDto, CreateTransactionDto, CreateExpenseDto, ApproveExpenseDto, ExpenseFiltersDto } from "./dto/finance.dto"

@ApiTags("Finance")
@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post("cashbox/open")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Abrir caja del dia",
    description: "Inicia una sesion de caja con saldo inicial. Solo una caja puede estar abierta por dia. Requiere MFA para prevenir aperturas no autorizadas.",
  })
  @ApiResponse({ status: 201, description: "Caja abierta exitosamente" })
  @ApiResponse({ status: 401, description: "JWT invalido o MFA no verificado" })
  @ApiResponse({ status: 403, description: "Solo ADMIN u OWNER" })
  @ApiResponse({ status: 409, description: "Ya existe una caja abierta hoy" })
  openCashbox(@CurrentUser() user: AuthUser, @Body() dto: OpenCashboxDto) {
    return this.financeService.openCashbox(user.id, dto)
  }

  @Post("cashbox/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Cerrar caja del dia",
    description: "Cierra la sesion de caja activa. Calcula automaticamente la discrepancia entre el efectivo esperado (apertura + ingresos - gastos) y el efectivo real contado. Discrepancia > S/50 dispara alerta antifraude via BullMQ.",
  })
  @ApiResponse({ status: 200, description: "Caja cerrada - incluye calculo de discrepancia" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo ADMIN u OWNER" })
  @ApiResponse({ status: 404, description: "No hay caja abierta para cerrar" })
  closeCashbox(@CurrentUser() user: AuthUser, @Body() dto: CloseCashboxDto) {
    return this.financeService.closeCashbox(user.id, dto)
  }

  @Get("cashbox/today")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Consultar estado de caja actual", description: "Retorna la sesion de caja abierta hoy con todas las transacciones registradas. Si no hay caja abierta, retorna open: false." })
  @ApiResponse({ status: 200, description: "Estado de la caja (abierta o cerrada)" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Roles: ADMIN, FINANCE, OWNER" })
  getTodaySession() {
    return this.financeService.getTodaySession()
  }

  @Post("cashbox/transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Registrar transaccion en caja", description: "Agrega un pago o gasto a la sesion de caja activa. La caja debe estar abierta." })
  @ApiQuery({ name: "sessionId", description: "ID de la sesion de caja", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiResponse({ status: 201, description: "Transaccion registrada" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo ADMIN o FINANCE" })
  @ApiResponse({ status: 404, description: "Sesion de caja no encontrada" })
  @ApiResponse({ status: 422, description: "La caja no esta abierta" })
  addTransaction(@Body() dto: CreateTransactionDto, @Query("sessionId") sessionId: string) {
    return this.financeService.addTransaction(sessionId, dto)
  }

  @Post("expenses")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Crear solicitud de gasto",
    description: "Registra un gasto pendiente de aprobacion con nivel segun monto: <=S/100 FINANCE, <=S/500 ADMIN, <=S/2000 OWNER, >S/2000 DUAL_OWNER. Gastos >=S/200 o categoria SERVICIOS/OTHER disparan alerta BullMQ.",
  })
  @ApiResponse({ status: 201, description: "Gasto creado - pendiente de aprobacion" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 401, description: "JWT invalido o MFA no verificado" })
  @ApiResponse({ status: 403, description: "Roles: FINANCE, ADMIN, OWNER" })
  createExpense(@CurrentUser() user: AuthUser, @Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(user.id, dto)
  }

  @Get("expenses/pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Listar gastos pendientes de aprobacion", description: "Retorna todos los gastos en estado PENDING_APPROVAL. Excluye los del usuario consultante para evitar auto-aprobacion." })
  @ApiResponse({ status: 200, description: "Lista de gastos pendientes" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getPendingExpenses(@CurrentUser() user: AuthUser) {
    return this.financeService.getPendingExpenses(user.id)
  }

  @Post("expenses/:id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Aprobar o rechazar gasto",
    description: "Procesa la decision sobre un gasto pendiente. No se permite auto-aprobacion. Valida nivel jerarquico del aprobador vs nivel requerido por el gasto. Al aprobar se marca como DISBURSED.",
  })
  @ApiParam({ name: "id", description: "ID del gasto (UUID v4)" })
  @ApiResponse({ status: 200, description: "Gasto aprobado (DISBURSED) o rechazado (REJECTED)" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Auto-aprobacion prohibida, nivel insuficiente, o rol no autorizado" })
  @ApiResponse({ status: 404, description: "Gasto no encontrado" })
  @ApiResponse({ status: 422, description: "Gasto ya fue procesado" })
  approveExpense(@Param("id") id: string, @CurrentUser() user: AuthUser, @Body() dto: ApproveExpenseDto) {
    return this.financeService.approveExpense(id, user.id, dto)
  }

  @Get("expenses")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Listar gastos con filtros", description: "Listado paginado de gastos con filtros por estado, categoria, solicitante y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado paginado de gastos" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getExpenses(@Query() filters: ExpenseFiltersDto) {
    return this.financeService.getExpenses(filters)
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Dashboard financiero", description: "KPIs financieros: ingresos, gastos, ganancia neta, transacciones, ordenes activas, aprobaciones pendientes. Periodo: day, week, month." })
  @ApiQuery({ name: "period", description: "Periodo de analisis", enum: ["day", "week", "month"], example: "month", required: false })
  @ApiResponse({ status: 200, description: "Resumen financiero del periodo" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getDashboard(@Query("period") period: "day" | "week" | "month" = "month") {
    return this.financeService.getDashboard(period)
  }

  @Get("cashflow")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.FINANCE)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Flujo de caja", description: "Analisis de entradas y salidas de efectivo agrupadas por metodo de pago en un rango de fechas." })
  @ApiQuery({ name: "from", description: "Fecha inicio (ISO 8601)", example: "2026-06-01", required: false })
  @ApiQuery({ name: "to", description: "Fecha fin (ISO 8601)", example: "2026-06-30", required: false })
  @ApiResponse({ status: 200, description: "Flujo de caja detallado con totales" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getCashflow(@Query("from") from?: string, @Query("to") to?: string) {
    return this.financeService.getCashflow(from ? new Date(from) : undefined, to ? new Date(to) : undefined)
  }

  @Get("cashbox/history")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.FINANCE)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Historial de cierres de caja", description: "Listado paginado de sesiones de caja cerradas con sus transacciones y usuarios responsables." })
  @ApiQuery({ name: "limit", description: "Resultados por pagina", example: "20", required: false })
  @ApiQuery({ name: "cursor", description: "Cursor de paginacion", example: "550e8400-e29b-41d4-a716-446655440000", required: false })
  @ApiResponse({ status: 200, description: "Historial de cajas cerradas" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getCashboxHistory(@Query("limit") limit?: number, @Query("cursor") cursor?: string) {
    return this.financeService.getCashboxHistory(limit, cursor)
  }

  @Post("qr/generate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Generar QR dinamico de cobro", description: "Genera QR de pago para una OT con expiracion de 7 minutos." })
  async generatePaymentQR(@CurrentUser() user: AuthUser, @Body() body: { workOrderId: string }) {
    return this.financeService.generatePaymentQR(body.workOrderId, user.id)
  }
}
