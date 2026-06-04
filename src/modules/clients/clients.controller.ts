import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { ClientsService } from "./clients.service"
import { CreateClientDto, UpdateClientDto } from "./dto/clients.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("Clients")
@Controller("clients")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
@ApiBearerAuth("access-token")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: "Listar clientes", description: "Listado paginado de clientes con busqueda por nombre, apellido o DNI. Soporta paginacion por cursor." })
  @ApiQuery({ name: "search", description: "Busqueda por nombre, apellido o DNI", required: false, example: "Gonzales" })
  @ApiQuery({ name: "limit", description: "Resultados por pagina (default 20)", required: false })
  @ApiQuery({ name: "cursor", description: "Cursor para paginacion", required: false })
  @ApiResponse({ status: 200, description: "Listado paginado de clientes" })
  @ApiResponse({ status: 401, description: "JWT invalido" })
  findAll(@Query("search") search?: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.clientsService.findAll(search, limit ? parseInt(limit, 10) : undefined, cursor)
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener cliente por ID", description: "Retorna datos completos del cliente incluyendo sus vehiculos registrados." })
  @ApiParam({ name: "id", description: "ID del cliente (UUID v4)" })
  @ApiResponse({ status: 200, description: "Datos del cliente con vehiculos" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  findOne(@Param("id") id: string) { return this.clientsService.findOne(id) }

  @Post()
  @ApiOperation({ summary: "Registrar nuevo cliente", description: "Crea un cliente persona natural con DNI unico. Si el DNI ya existe, retorna conflicto." })
  @ApiResponse({ status: 201, description: "Cliente creado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 409, description: "DNI ya registrado" })
  create(@Body() dto: CreateClientDto) { return this.clientsService.create(dto) }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar datos del cliente" })
  @ApiParam({ name: "id", description: "ID del cliente (UUID v4)" })
  @ApiResponse({ status: 200, description: "Cliente actualizado" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 409, description: "DNI duplicado con otro cliente" })
  update(@Param("id") id: string, @Body() dto: UpdateClientDto) { return this.clientsService.update(id, dto) }

  @Get(":id/history")
  @ApiOperation({ summary: "Historial de ordenes del cliente", description: "Todas las OT asociadas al cliente, ordenadas por fecha descendente. Incluye datos del vehiculo y mecanico." })
  @ApiParam({ name: "id", description: "ID del cliente (UUID v4)" })
  @ApiResponse({ status: 200, description: "Historial de OT del cliente" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  getHistory(@Param("id") id: string) { return this.clientsService.getHistory(id) }
}
