import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { VehiclesService } from "./vehicles.service"
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("Vehicles")
@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get("lookup/:plate")
  @ApiOperation({
    summary: "Buscar vehiculo por placa (publico con cache)",
    description: "Busqueda express por numero de placa. Utiliza Redis Cache-Aside con TTL de 300s para responder en milisegundos a consultas concurrentes desde tablets y portal del cliente. Acceso sin JWT requerido.",
  })
  @ApiParam({ name: "plate", description: "Numero de placa del vehiculo (formato peruano)", example: "ABC-123" })
  @ApiResponse({ status: 200, description: "Vehiculo encontrado con datos del propietario" })
  @ApiResponse({ status: 404, description: "Vehiculo no encontrado" })
  findByPlate(@Param("plate") plate: string) { return this.vehiclesService.findByPlate(plate) }

  @Get("workshop-fleet")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Flota interna del taller", description: "Vehiculos sin cliente asignado (uso interno del taller)." })
  @ApiResponse({ status: 200, description: "Lista de vehiculos de flota" })
  getWorkshopFleet() { return this.vehiclesService.getWorkshopFleet() }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Listar vehiculos", description: "Listado paginado con busqueda por placa o marca." })
  @ApiQuery({ name: "search", required: false, example: "Toyota" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "cursor", required: false })
  @ApiResponse({ status: 200, description: "Listado paginado de vehiculos" })
  findAll(@Query("search") search?: string, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    return this.vehiclesService.findAll(search, limit ? parseInt(limit, 10) : undefined, cursor)
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Detalle de vehiculo", description: "Datos completos del vehiculo con sus ultimas 10 OT." })
  @ApiParam({ name: "id", description: "ID del vehiculo (UUID v4)" })
  @ApiResponse({ status: 200, description: "Vehiculo con historial de OT" })
  @ApiResponse({ status: 404, description: "Vehiculo no encontrado" })
  findOne(@Param("id") id: string) { return this.vehiclesService.findOne(id) }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Registrar nuevo vehiculo" })
  @ApiResponse({ status: 201, description: "Vehiculo creado" })
  @ApiResponse({ status: 400, description: "Datos invalidos" })
  @ApiResponse({ status: 404, description: "Cliente no encontrado" })
  @ApiResponse({ status: 409, description: "Placa ya registrada" })
  create(@Body() dto: CreateVehicleDto) { return this.vehiclesService.create(dto) }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Actualizar datos del vehiculo", description: "Invalida cache Redis de placa y listados al modificar." })
  @ApiParam({ name: "id", description: "ID del vehiculo (UUID v4)" })
  @ApiResponse({ status: 200, description: "Vehiculo actualizado" })
  @ApiResponse({ status: 404, description: "Vehiculo no encontrado" })
  @ApiResponse({ status: 409, description: "Placa duplicada" })
  update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) { return this.vehiclesService.update(id, dto) }
}
