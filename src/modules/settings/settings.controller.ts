import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { SettingsService } from "./settings.service"
import { CreateSettingDto, UpdateSettingDto, SettingFilterDto } from "./dto/settings.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("settings")
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  getAll() {
    return this.settingsService.getAll()
  }

  @Get("category/:category")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  getByCategory(@Param("category") category: string) {
    return this.settingsService.getByCategory(category)
  }

  @Get(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  get(@Param("key") key: string) {
    return this.settingsService.get(key)
  }

  @Post()
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateSettingDto, @CurrentUser() user: AuthUser) {
    return this.settingsService.create(dto.key, dto.value, dto.category, dto.isPublic, user.id)
  }

  @Patch(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  update(
    @Param("key") key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.update(key, dto.value, user.id)
  }

  @Post(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  set(
    @Param("key") key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.settingsService.set(key, dto.value, user.id)
  }

  @Delete(":key")
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  delete(@Param("key") key: string) {
    return this.settingsService.delete(key)
  }
}
