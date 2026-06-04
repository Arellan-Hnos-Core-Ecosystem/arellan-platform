import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common"
import { PersonnelService } from "./personnel.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"
import { PersonnelFilterDto, UpdateRoleDto, UpdateStatusDto, CheckInOutDto, AuthorizeVehicleUsageDto } from "./dto/personnel.dto"

@Controller("personnel")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findAll(@Query() filters: PersonnelFilterDto) {
    return this.personnelService.findAll(filters)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.MECHANIC, UserRole.TRAINEE)
  findOne(@Param("id") id: string) {
    return this.personnelService.findOne(id)
  }

  @Patch(":id/role")
  @Roles(UserRole.OWNER)
  updateRole(
    @Param("id") id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.personnelService.updateRole(id, dto.role, user.id)
  }

  @Patch(":id/status")
  @Roles(UserRole.OWNER)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.personnelService.updateStatus(id, dto.status)
  }

  @Post("attendance/check-in")
  @UseGuards(JwtAuthGuard)
  checkIn(@CurrentUser() user: AuthUser, @Body() dto: CheckInOutDto) {
    return this.personnelService.checkInByUser(user.id, dto.notes)
  }

  @Post("attendance/check-out")
  @UseGuards(JwtAuthGuard)
  checkOut(@CurrentUser() user: AuthUser, @Body() dto: CheckInOutDto) {
    return this.personnelService.checkOutByUser(user.id, dto.notes)
  }

  @Get("attendance/today")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getAttendanceToday() {
    return this.personnelService.getTodayAttendance()
  }

  @Post("vehicle-usage/authorize")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  authorizeVehicleUsage(
    @Body() dto: AuthorizeVehicleUsageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.personnelService.authorizeVehicleUsage(dto, user.id, user.role)
  }

  @Get("vehicle-usage/active")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getActiveVehicleUsages() {
    return this.personnelService.getActiveVehicleUsages()
  }

  @Get("vehicle-usage/overdue")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getOverdueVehicleUsages() {
    return this.personnelService.getOverdueVehicleUsages()
  }
}
