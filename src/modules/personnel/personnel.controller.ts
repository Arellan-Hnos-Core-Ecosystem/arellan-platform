import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { PersonnelService } from "./personnel.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"
import { PersonnelFilterDto, UpdateRoleDto, UpdateStatusDto } from "./dto/personnel.dto"

@Controller("personnel")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() filters: PersonnelFilterDto,
  ) {
    return this.personnelService.findAll(
      user.role,
      filters.role,
      filters.status,
      filters.limit,
      filters.cursor,
    )
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.MECHANIC, UserRole.TRAINEE)
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.personnelService.findOne(id, user.id, user.role)
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
}
