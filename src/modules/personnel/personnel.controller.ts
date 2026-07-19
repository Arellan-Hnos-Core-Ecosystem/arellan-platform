import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { PersonnelService } from "./personnel.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"
import { PersonnelFilterDto, UpdateRoleDto, UpdateAccountStatusDto, CheckInOutDto, AuthorizeVehicleUsageDto } from "./dto/personnel.dto"

@ApiTags("Personnel")
@Controller("personnel")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth("access-token")
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Listar personal", description: "Listado paginado del personal con filtros por rol, estado y busqueda por nombre/email." })
  @ApiResponse({ status: 200, description: "Listado paginado de personal" })
  findAll(@Query() filters: PersonnelFilterDto) { return this.personnelService.findAll(filters) }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.MECHANIC, UserRole.TRAINEE)
  @ApiOperation({ summary: "Perfil del personal", description: "Datos completos: cuenta, asistencia del mes, uso de vehiculos activos." })
  @ApiParam({ name: "id", description: "ID del personal (UUID v4 de la cuenta)" })
  @ApiResponse({ status: 200, description: "Perfil completo del personal" })
  @ApiResponse({ status: 404, description: "Personal no encontrado" })
  findOne(@Param("id") id: string) { return this.personnelService.findOne(id) }

  @Patch(":id/role")
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: "Cambiar rol del personal (OWNER)", description: "Modifica el rol de un usuario. No se puede cambiar el rol de un OWNER ni asignar rol OWNER." })
  @ApiParam({ name: "id", description: "ID de la cuenta (UUID v4)" })
  @ApiResponse({ status: 200, description: "Rol actualizado" })
  @ApiResponse({ status: 403, description: "No se puede cambiar OWNER ni asignar OWNER" })
  updateRole(@Param("id") id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: AuthUser) { return this.personnelService.updateRole(id, dto.role, user.id) }

  @Patch(":id/status")
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: "Cambiar estado del personal (OWNER)", description: "Activa, inactiva o termina una cuenta." })
  @ApiParam({ name: "id", description: "ID de la cuenta (UUID v4)" })
  @ApiResponse({ status: 200, description: "Estado actualizado" })
  @ApiResponse({ status: 403, description: "No se puede cambiar estado de OWNER" })
  updateStatus(@Param("id") id: string, @Body() dto: UpdateAccountStatusDto) { return this.personnelService.updateStatus(id, dto.status) }

  @Post("attendance/check-in")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Registrar entrada (check-in)", description: "Marca la hora de ingreso del usuario autenticado. Si llega despues de las 9am se registra como LATE." })
  @ApiResponse({ status: 201, description: "Check-in registrado" })
  @ApiResponse({ status: 409, description: "Ya registraste entrada hoy" })
  checkIn(@CurrentUser() user: AuthUser, @Body() dto: CheckInOutDto) { return this.personnelService.checkInByUser(user.id, dto.notes) }

  @Post("attendance/check-out")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Registrar salida (check-out)", description: "Marca la hora de salida. Requiere haber hecho check-in previamente." })
  @ApiResponse({ status: 200, description: "Check-out registrado" })
  @ApiResponse({ status: 404, description: "No hay check-in hoy" })
  @ApiResponse({ status: 409, description: "Ya registraste salida hoy" })
  checkOut(@CurrentUser() user: AuthUser, @Body() dto: CheckInOutDto) { return this.personnelService.checkOutByUser(user.id, dto.notes) }

  @Get("attendance/today")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Asistencia del dia", description: "Resumen de asistencias de hoy: presentes, ausentes, tardanzas." })
  @ApiResponse({ status: 200, description: "Resumen de asistencia diaria" })
  getAttendanceToday() { return this.personnelService.getTodayAttendance() }

  @Post("vehicle-usage/authorize")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Autorizar uso de vehiculo del taller", description: "OWNER o ADMIN autorizan a un empleado a usar un vehiculo de la flota. Registra kilometraje de salida y proposito." })
  @ApiResponse({ status: 201, description: "Uso de vehiculo autorizado" })
  @ApiResponse({ status: 403, description: "Solo OWNER o ADMIN" })
  @ApiResponse({ status: 404, description: "Personal o vehiculo no encontrado" })
  authorizeVehicleUsage(@Body() dto: AuthorizeVehicleUsageDto, @CurrentUser() user: AuthUser) { return this.personnelService.authorizeVehicleUsage(dto, user.id, user.role) }

  @Get("vehicle-usage/active")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Usos de vehiculo activos", description: "Vehiculos de la flota actualmente en uso (PENDING_RETURN)." })
  @ApiResponse({ status: 200, description: "Lista de usos activos" })
  getActiveVehicleUsages() { return this.personnelService.getActiveVehicleUsages() }

  @Get("vehicle-usage/overdue")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: "Usos de vehiculo vencidos", description: "Vehiculos no devueltos a tiempo (fecha de retorno esperada superada)." })
  @ApiResponse({ status: 200, description: "Lista de usos vencidos" })
  getOverdueVehicleUsages() { return this.personnelService.getOverdueVehicleUsages() }
}
