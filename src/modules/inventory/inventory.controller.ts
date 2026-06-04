import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { InventoryService } from "./inventory.service"
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Inventory")
@Controller("inventory")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC)
  @ApiOperation({ summary: "Consultar todos los movimientos", description: "Listado paginado de movimientos de inventario con filtros opcionales por item y tipo." })
  @ApiQuery({ name: "itemId", description: "Filtrar por ID de item", required: false })
  @ApiQuery({ name: "type", description: "Filtrar por tipo: IN, OUT, ADJUSTMENT", required: false })
  @ApiQuery({ name: "limit", description: "Resultados por pagina", required: false })
  @ApiQuery({ name: "cursor", description: "Cursor de paginacion", required: false })
  @ApiResponse({ status: 200, description: "Listado de movimientos" })
  getAllMovements(@Query("itemId") itemId?: string, @Query("type") type?: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.inventoryService.getAllMovements(itemId, type, limit ? parseInt(limit, 10) : undefined, cursor)
  }

  @Get("critical/list")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC)
  @ApiOperation({ summary: "Listar items con stock critico", description: "Items cuyo stock actual es menor o igual al stock minimo configurado. Cache Redis (TTL 60s)." })
  @ApiResponse({ status: 200, description: "Lista de items criticos ordenados por stock ascendente" })
  getCriticalStock() {
    return this.inventoryService.getCriticalStock()
  }

  @Get("low-stock")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC)
  @ApiOperation({ summary: "Alertas de stock bajo", description: "Alias de critical/list para compatibilidad con dashboard." })
  @ApiResponse({ status: 200, description: "Items con stock bajo" })
  getLowStock() {
    return this.inventoryService.getCriticalStock()
  }

  @Get("valuation")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC)
  @ApiOperation({ summary: "Valorizacion del inventario", description: "Calcula: total de items activos, valor total a costo, valor total a precio de venta y cantidad de items con stock bajo. Cache Redis (TTL 120s)." })
  @ApiResponse({ status: 200, description: "Resumen de valorizacion del inventario" })
  getValuation() {
    return this.inventoryService.getValuation()
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC, UserRole.TRAINEE)
  @ApiOperation({ summary: "Listar catalogo de inventario", description: "Catalogo paginado con filtro por categoria. Soporta modo lowStock para ver solo items bajo minimo. Cache Redis Cache-Aside (TTL 120s)." })
  @ApiQuery({ name: "category", description: "Filtrar por ID de categoria", required: false })
  @ApiQuery({ name: "lowStock", description: "Solo items con stock bajo (true/false)", required: false, example: "false" })
  @ApiQuery({ name: "limit", description: "Resultados por pagina", required: false })
  @ApiQuery({ name: "cursor", description: "Cursor de paginacion", required: false })
  @ApiResponse({ status: 200, description: "Catalogo de inventario paginado" })
  findAll(@Query("category") category?: string, @Query("lowStock") lowStock?: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.inventoryService.findAll(category, lowStock === "true", limit ? parseInt(limit, 10) : undefined, cursor)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE, UserRole.MECHANIC, UserRole.TRAINEE)
  @ApiOperation({ summary: "Obtener detalle de un item", description: "Retorna el item completo con sus datos. Cache Redis (TTL 300s)." })
  @ApiParam({ name: "id", description: "ID del item (UUID v4)" })
  @ApiResponse({ status: 200, description: "Item encontrado" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  findOne(@Param("id") id: string) {
    return this.inventoryService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Crear nuevo item de inventario", description: "Registra un nuevo repuesto/insumo con SKU unico, stock inicial y precio de venta. Invalida cache de catalogo." })
  @ApiResponse({ status: 201, description: "Item creado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 409, description: "SKU ya existe" })
  create(@Body() dto: CreateItemDto) {
    return this.inventoryService.create(dto)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Actualizar item de inventario", description: "Modifica datos del item. Si cambia SKU valida que no exista duplicado. Invalida cache individual y de catalogo." })
  @ApiParam({ name: "id", description: "ID del item (UUID v4)" })
  @ApiResponse({ status: 200, description: "Item actualizado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @ApiResponse({ status: 409, description: "SKU duplicado" })
  update(@Param("id") id: string, @Body() dto: UpdateItemDto) {
    return this.inventoryService.update(id, dto)
  }

  @Post(":id/movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({
    summary: "Registrar movimiento de inventario",
    description: "Ejecuta IN (ingreso), OUT (salida, requiere orderId) o ADJUSTMENT (ajuste, requiere justificacion). Transaccion atomica: movimiento + actualizacion de stock. Invalida toda la cache de inventario.",
  })
  @ApiParam({ name: "id", description: "ID del item (UUID v4)" })
  @ApiResponse({ status: 201, description: "Movimiento registrado y stock actualizado" })
  @ApiResponse({ status: 400, description: "Datos invalidos o stock insuficiente para OUT" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  addMovement(@CurrentUser() user: AuthUser, @Param("id") id: string, @Body() dto: InventoryMovementDto) {
    return this.inventoryService.addMovement(user.id, id, dto)
  }

  @Get(":id/movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.MECHANIC, UserRole.TRAINEE)
  @ApiOperation({ summary: "Historial de movimientos de un item", description: "Listado paginado de todos los movimientos registrados para un item especifico." })
  @ApiParam({ name: "id", description: "ID del item (UUID v4)" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiResponse({ status: 200, description: "Historial de movimientos" })
  getMovements(@Param("id") id: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.inventoryService.getMovements(id, limit ? parseInt(limit, 10) : undefined, cursor)
  }

  @Post(":id/reserve")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MECHANIC)
  @ApiOperation({
    summary: "Reservar items para una orden de trabajo",
    description: "Reserva stock para una OT especifica. Transaccion atomica: decrementa stock + registra movimiento OUT + evento en la OT. Invalida cache de inventario.",
  })
  @ApiParam({ name: "id", description: "ID del item a reservar (UUID v4)" })
  @ApiResponse({ status: 200, description: "Stock reservado para la OT" })
  @ApiResponse({ status: 400, description: "Stock insuficiente" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  reserveForOrder(@Param("id") itemId: string, @Body() body: { quantity: number; workOrderId: string }, @CurrentUser() user: AuthUser) {
    return this.inventoryService.reserveForOrder(itemId, body.quantity, body.workOrderId, user.id)
  }
}
