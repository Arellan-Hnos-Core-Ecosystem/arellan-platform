import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { AttendanceService } from "./attendance.service"
import {
  AttendanceFilterDto,
  CheckInDto,
  CheckOutDto,
  VerifyAttendanceDto,
} from "./dto/attendance.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@Controller("attendance")
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: AttendanceFilterDto) {
    return this.attendanceService.findAll(filters)
  }

  @Get("today")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  getTodayStats() {
    return this.attendanceService.getTodayStats()
  }

  @Get(":personnelId")
  getByPersonnel(
    @Param("personnelId") personnelId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.attendanceService.getByPersonnel(personnelId, from, to)
  }

  @Post("check-in")
  checkIn(@Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto.personnelId, dto.notes)
  }

  @Post("check-out")
  checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto.personnelId, dto.notes)
  }

  @Post("verify")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  verify(@Body() dto: VerifyAttendanceDto) {
    return this.attendanceService.verify(dto.personnelId, dto.date, dto.verifiedBy)
  }
}
