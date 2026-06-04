import { Controller, Get, Post, Body, Param, Query, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import { AttendanceService } from "./attendance.service"
import { AttendanceFilterDto, CheckInDto, CheckOutDto, VerifyAttendanceDto } from "./dto/attendance.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@ApiTags("Attendance")
@Controller("attendance")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar asistencias", description: "Registros de asistencia con filtros por tipo (PRESENT, ABSENT, LATE, etc.) y rango de fechas." })
  @ApiResponse({ status: 200, description: "Listado de asistencias" })
  findAll(@Query() filters: AttendanceFilterDto) { return this.attendanceService.findAll(filters) }

  @Get("today")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Resumen de asistencia del dia", description: "Estadisticas de hoy: total de personal, presentes, ausentes, tardanzas." })
  @ApiResponse({ status: 200, description: "Resumen de asistencia diaria" })
  getTodayStats() { return this.attendanceService.getTodayStats() }

  @Get(":personnelId")
  @ApiOperation({ summary: "Asistencia de un empleado", description: "Historial de asistencia de un empleado en un rango de fechas." })
  @ApiParam({ name: "personnelId", description: "ID del personal (UUID v4)" })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  @ApiResponse({ status: 200, description: "Historial de asistencia" })
  getByPersonnel(@Param("personnelId") personnelId: string, @Query("from") from?: string, @Query("to") to?: string) { return this.attendanceService.getByPersonnel(personnelId, from, to) }

  @Post("check-in")
  @ApiOperation({ summary: "Registrar entrada", description: "Marca la hora de ingreso. Si es despues de las 9am se marca como LATE." })
  @ApiResponse({ status: 201, description: "Check-in registrado" })
  @ApiResponse({ status: 409, description: "Ya tiene check-in hoy" })
  checkIn(@Body() dto: CheckInDto) { return this.attendanceService.checkIn(dto.personnelId, dto.notes) }

  @Post("check-out")
  @ApiOperation({ summary: "Registrar salida" })
  @ApiResponse({ status: 200, description: "Check-out registrado" })
  @ApiResponse({ status: 404, description: "No hay check-in hoy" })
  checkOut(@Body() dto: CheckOutDto) { return this.attendanceService.checkOut(dto.personnelId, dto.notes) }

  @Post("verify")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Verificar asistencia", description: "ADMIN/OWNER verifican manualmente un registro de asistencia." })
  @ApiResponse({ status: 200, description: "Asistencia verificada" })
  verify(@Body() dto: VerifyAttendanceDto) { return this.attendanceService.verify(dto.personnelId, dto.date, dto.verifiedBy) }
}
