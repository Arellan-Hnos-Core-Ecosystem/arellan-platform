import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common"
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import { SettingsService } from "./settings.service"
import { CreateSettingDto, UpdateSettingDto } from "./dto/settings.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@ApiTags("Settings")
@Controller("settings")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Listar todas las configuraciones", description: "Retorna todas las variables de configuracion del sistema." })
  @ApiResponse({ status: 200, description: "Lista de configuraciones" })
  getAll() { return this.settingsService.getAll() }

  @Get("category/:category")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Configuraciones por categoria", description: "Filtra por categoria: GENERAL, BUSINESS, NOTIFICATIONS." })
  @ApiParam({ name: "category", description: "Categoria de configuracion", example: "BUSINESS" })
  @ApiResponse({ status: 200, description: "Configuraciones de la categoria" })
  getByCategory(@Param("category") category: string) { return this.settingsService.getByCategory(category) }

  @Get(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Obtener configuracion por clave" })
  @ApiParam({ name: "key", description: "Clave de configuracion", example: "shop_name" })
  @ApiResponse({ status: 200, description: "Valor de la configuracion" })
  @ApiResponse({ status: 404, description: "Configuracion no encontrada" })
  get(@Param("key") key: string) { return this.settingsService.get(key) }

  @Post()
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Crear configuracion (OWNER)" })
  @ApiResponse({ status: 201, description: "Configuracion creada" })
  @ApiResponse({ status: 403, description: "Solo OWNER" })
  create(@Body() dto: CreateSettingDto, @CurrentUser() user: AuthUser) { return this.settingsService.create(dto.key, dto.value, dto.category, dto.isPublic, user.id) }

  @Patch(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Actualizar configuracion" })
  @ApiParam({ name: "key", description: "Clave de configuracion" })
  @ApiResponse({ status: 200, description: "Configuracion actualizada" })
  @ApiResponse({ status: 404, description: "Configuracion no encontrada" })
  update(@Param("key") key: string, @Body() dto: UpdateSettingDto, @CurrentUser() user: AuthUser) { return this.settingsService.update(key, dto.value, user.id) }

  @Post(":key")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Establecer valor de configuracion (upsert)" })
  @ApiParam({ name: "key", description: "Clave de configuracion" })
  @ApiResponse({ status: 200, description: "Configuracion establecida" })
  set(@Param("key") key: string, @Body() dto: UpdateSettingDto, @CurrentUser() user: AuthUser) { return this.settingsService.set(key, dto.value, user.id) }

  @Delete(":key")
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Eliminar configuracion (OWNER)" })
  @ApiParam({ name: "key", description: "Clave de configuracion" })
  @ApiResponse({ status: 200, description: "Configuracion eliminada" })
  @ApiResponse({ status: 404, description: "Configuracion no encontrada" })
  delete(@Param("key") key: string) { return this.settingsService.delete(key) }
}
