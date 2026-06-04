import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { PurchasesService } from "./purchases.service"
import { PurchaseFilterDto, CreatePurchaseDto, UpdatePurchaseStatusDto, ReceiveItemsDto } from "./dto/purchases.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Purchases")
@Controller("purchases")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar compras", description: "Listado paginado de ordenes de compra con filtros por estado, proveedor y busqueda. Incluye conteo de items." })
  @ApiResponse({ status: 200, description: "Listado paginado de compras" })
  findAll(@Query() filters: PurchaseFilterDto) { return this.purchasesService.findAll(filters) }

  @Get("imports")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Compras de importacion", description: "Ordenes de compra marcadas como importadas (isImported=true)." })
  @ApiResponse({ status: 200, description: "Lista de compras importadas" })
  getImports() { return this.purchasesService.getImports() }

  @Get("supplier/:supplierId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Compras por proveedor" })
  @ApiParam({ name: "supplierId", description: "ID del proveedor (UUID v4)" })
  @ApiResponse({ status: 200, description: "Compras del proveedor" })
  @ApiResponse({ status: 404, description: "Proveedor no encontrado" })
  getBySupplier(@Param("supplierId") supplierId: string) { return this.purchasesService.getBySupplier(supplierId) }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Detalle de compra", description: "OC con items, proveedor y comisiones asociadas." })
  @ApiParam({ name: "id", description: "ID de la compra (UUID v4)" })
  @ApiResponse({ status: 200, description: "Compra detallada" })
  @ApiResponse({ status: 404, description: "Compra no encontrada" })
  findOne(@Param("id") id: string) { return this.purchasesService.findOne(id) }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Crear orden de compra", description: "Genera OC con numero autoincremental (OC-AAAA-NNNN). Calcula subtotal, impuestos, envio y total automaticamente." })
  @ApiResponse({ status: 201, description: "OC creada en estado DRAFT" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: AuthUser) { return this.purchasesService.create(dto, user.id) }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Cambiar estado de compra", description: "Transicion segun maquina de estados: DRAFT->SENT->CONFIRMED->PARTIALLY_RECEIVED->RECEIVED. CANCELLED desde cualquier estado." })
  @ApiParam({ name: "id", description: "ID de la compra (UUID v4)" })
  @ApiResponse({ status: 200, description: "Estado actualizado" })
  @ApiResponse({ status: 404, description: "Compra no encontrada" })
  @ApiResponse({ status: 409, description: "Transicion no permitida" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdatePurchaseStatusDto, @CurrentUser() user: AuthUser) { return this.purchasesService.updateStatus(id, dto.status, user.id) }

  @Post(":id/receive")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Recepcionar items de compra", description: "Registra la recepcion parcial o total de items. Incrementa el stock automaticamente y registra movimientos de inventario. Transiciona a RECEIVED cuando todos los items estan completos." })
  @ApiParam({ name: "id", description: "ID de la compra (UUID v4)" })
  @ApiResponse({ status: 200, description: "Items recibidos y stock actualizado" })
  @ApiResponse({ status: 404, description: "Compra o item no encontrado" })
  @ApiResponse({ status: 422, description: "Cantidad recibida excede la ordenada" })
  receiveItems(@Param("id") id: string, @Body() dto: ReceiveItemsDto, @CurrentUser() user: AuthUser) { return this.purchasesService.receiveItems(id, dto, user.id) }
}
