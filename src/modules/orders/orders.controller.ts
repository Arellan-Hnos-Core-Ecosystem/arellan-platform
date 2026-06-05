import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req, UploadedFiles } from "@nestjs/common"
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from "@nestjs/swagger"
import { OrdersService } from "./orders.service"
import { AuthUser } from "../auth/auth.service"
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto, ApplyDiscountDto, RequestPartsDto, MechanicProgressDto } from "./dto/orders.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole, OrderStatus } from "@prisma/client"

@ApiTags("Orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: "Listar ordenes de trabajo",
    description: "Listado paginado de todas las OT con filtros por estado, mecanico, rango de fechas, cursor. Incluye datos de vehiculo, cliente y mecanico asignado.",
  })
  @ApiResponse({ status: 200, description: "Listado paginado de ordenes" })
  @ApiResponse({ status: 401, description: "JWT invalido o expirado" })
  findAll(@Query() filters: OrderFilterDto) {
    return this.ordersService.findAll(filters)
  }

  @Get("my")
  @Roles(UserRole.MECHANIC)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Listar mis ordenes asignadas (mecanico)",
    description: "Retorna las OT asignadas al mecanico autenticado (via JWT). Incluye repuestos consumidos y fotos. Usado por la tablet del taller (arellan-mechanic-ui).",
  })
  @ApiResponse({ status: 200, description: "Listado de OT del mecanico" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo rol MECHANIC" })
  findMyOrders(@CurrentUser() user: AuthUser, @Query() filters: OrderFilterDto) {
    return this.ordersService.findByMechanic(user.id, filters)
  }

  @Get("stats/summary")
  @ApiOperation({
    summary: "Estadisticas resumidas del taller",
    description: "KPIs: ordenes activas, recibidas hoy, completadas hoy, entregadas hoy, total historico, pendientes de pago, ingresos del dia, items con stock critico.",
  })
  @ApiResponse({ status: 200, description: "Resumen de estadisticas" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  getSummaryStats() {
    return this.ordersService.getSummaryStats()
  }

  @Get("by-status/:status")
  @ApiOperation({
    summary: "Filtrar ordenes por estado",
    description: "Atajo para listar ordenes filtradas exclusivamente por su estado actual en el flujo de trabajo.",
  })
  @ApiParam({ name: "status", description: "Estado de orden: RECEIVED, IN_DIAGNOSIS, BUDGETED, IN_PROGRESS, IN_REVIEW, READY, DELIVERED, CANCELLED", example: "IN_PROGRESS" })
  @ApiResponse({ status: 200, description: "Ordenes filtradas por estado" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  findByStatus(@Param("status") status: string) {
    return this.ordersService.findAll({ status: status as OrderStatus })
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de una orden", description: "Retorna la OT completa con partes, fotos, historial de estados, pagos asociados y datos del vehiculo/cliente/mecanico." })
  @ApiParam({ name: "id", description: "ID de la orden de trabajo (UUID v4)", example: "550e8400-e29b-41d4-a716-446655440000" })
  @ApiResponse({ status: 200, description: "Detalle completo de la OT" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id)
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Crear nueva orden de trabajo",
    description: "Registra una OT con numero autoincremental (OT-AAAA-NNNN). Asigna vehiculo, cliente y mecanico. Emite evento WebSocket order:created al dashboard gerencial.",
  })
  @ApiResponse({ status: 201, description: "OT creada exitosamente" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo OWNER o ADMIN" })
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.create(dto, user.id)
  }

  @Patch(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MECHANIC, UserRole.TRAINEE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Actualizar datos de una orden", description: "Modifica diagnostico, costos de mano de obra/repuestos, y fecha estimada de entrega. Recalcula totalCost automaticamente." })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "OT actualizada" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo OWNER o ADMIN" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  @ApiResponse({ status: 422, description: "No se puede modificar una OT cancelada" })
  update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto)
  }

  @Post(":id/status")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE, UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Transicionar estado de la orden",
    description: "Cambia el estado segun la maquina de estados valida. Al transicionar a DELIVERED valida que laborCost + partsCost == totalPaid (regla antifraude). Emite WebSocket order:status_changed. Alerta si pago Yape >= S/500.",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "Estado actualizado + evento WebSocket emitido" })
  @ApiResponse({ status: 400, description: "Transicion invalida segun flujo de trabajo" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo MECHANIC o ADMIN; DELIVERED bloqueado si pago insuficiente" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.updateStatus(id, dto, user.id)
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: "Cancelar orden (soft delete)", description: "Marca la OT como CANCELLED. Solo OWNER. No elimina fisicamente el registro." })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "OT cancelada" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  @ApiResponse({ status: 403, description: "Solo OWNER" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  @ApiResponse({ status: 422, description: "OT ya estaba cancelada" })
  remove(@Param("id") id: string) {
    return this.ordersService.softDelete(id)
  }

  @Post(":id/discount")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MECHANIC)
  @ApiOperation({
    summary: "Aplicar descuento a una orden",
    description: "Aplica descuento por monto fijo o porcentaje. Si el descuento supera el 20% del total, se requiere aprobacion de OWNER via flujo de aprobaciones.",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 200, description: "Descuento aplicado" })
  @ApiResponse({ status: 202, description: "Descuento pendiente de aprobacion OWNER (>20%)" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  applyDiscount(@Param("id") orderId: string, @Body() dto: ApplyDiscountDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.applyDiscount(orderId, dto, user.id, user.role)
  }

  @Post(":id/photos")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE, UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiOperation({
    summary: "Subir foto a una orden de trabajo",
    description: "Adjunta una imagen (JPEG/PNG) a la OT. Usado por mecanicos desde la tablet para documentar el estado del vehiculo. Invalida cache de ordenes.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { photo: { type: "string", format: "binary", description: "Archivo de imagen" }, description: { type: "string", example: "Filtro de aceite danado" } } } })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 201, description: "Foto subida y vinculada a la OT" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  async uploadPhoto(@Param("id") id: string, @UploadedFile() photo: Express.Multer.File, @Body("description") description?: string) {
    return this.ordersService.uploadPhoto(id, photo, description)
  }

  @Post(":id/parts")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE, UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Solicitar repuestos para una orden",
    description: "Agrega repuestos del inventario a la OT con descuento automatico de stock. Procesa una lista de items y registra eventos PART_REQUESTED en la bitacora.",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 201, description: "Repuestos solicitados y stock actualizado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 404, description: "OT o item no encontrado" })
  @ApiResponse({ status: 409, description: "Stock insuficiente u OT finalizada" })
  async requestParts(@Param("id") id: string, @Body() dto: RequestPartsDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.requestParts(id, dto, user.id, user.name)
  }

  @Post(":id/progress")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Reportar avance tecnico de una orden",
    description: "Registra el porcentaje de avance, repuestos instalados y horas de trabajo. Crea un evento en la bitacora de la OT para trazabilidad completa.",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiResponse({ status: 201, description: "Avance registrado en la bitacora" })
  @ApiResponse({ status: 404, description: "OT no encontrada" })
  async reportProgress(@Param("id") id: string, @Body() dto: MechanicProgressDto, @CurrentUser() user: AuthUser) {
    return this.ordersService.reportProgress(id, dto, user.id, user.name)
  }

  @Delete(":id/photos/:photoId")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE, UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Eliminar foto de una orden de trabajo",
    description: "Elimina una foto asociada a la OT y registra un evento PHOTO_DELETED en la bitacora.",
  })
  @ApiParam({ name: "id", description: "ID de la OT (UUID v4)" })
  @ApiParam({ name: "photoId", description: "ID de la foto a eliminar (UUID v4)" })
  @ApiResponse({ status: 200, description: "Foto eliminada y evento registrado" })
  @ApiResponse({ status: 404, description: "OT o foto no encontrada" })
  async deletePhoto(@Param("id") id: string, @Param("photoId") photoId: string, @CurrentUser() user: AuthUser) {
    return this.ordersService.deletePhoto(id, photoId, user.id, user.name)
  }

  @Post("checkin")
  @Roles(UserRole.MECHANIC, UserRole.TRAINEE, UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @UseInterceptors(FilesInterceptor("photos", 10))
  @ApiOperation({
    summary: "Ingreso rapido de vehiculo al taller",
    description: "Crea o encuentra un vehiculo por placa y genera una OT nueva. Recibe fotos multipart del vehiculo. Usado desde la tablet por el mecanico al recibir un auto.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: {
    plate: { type: "string", example: "ABC-123" },
    brand: { type: "string", example: "Toyota" },
    model: { type: "string", example: "Hiace" },
    kilometerReading: { type: "string", example: "85000" },
    fuelLevel: { type: "string", example: "HALF" },
    description: { type: "string", example: "Cambio de aceite y filtros" },
    photoPositions: { type: "string", example: "FRONT,BACK,LEFT,RIGHT" },
    photos: { type: "array", items: { type: "string", format: "binary" } },
  } } })
  @ApiResponse({ status: 201, description: "Vehiculo ingresado y OT creada" })
  @ApiResponse({ status: 409, description: "Ya existe una OT activa para esa placa" })
  async vehicleCheckin(
    @Body() body: { plate: string; brand: string; model: string; kilometerReading?: string; fuelLevel?: string; description?: string; photoPositions?: string },
    @UploadedFiles() photos?: Express.Multer.File[],
    @CurrentUser() user?: AuthUser,
  ) {
    return this.ordersService.vehicleCheckin(body, photos ?? [], user?.id ?? "system", user?.name ?? "Sistema")
  }
}
