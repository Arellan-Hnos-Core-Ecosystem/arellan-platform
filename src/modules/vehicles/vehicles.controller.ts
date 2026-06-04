import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { VehiclesService } from "./vehicles.service"
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get("lookup/:plate")
  findByPlate(@Param("plate") plate: string) {
    return this.vehiclesService.findByPlate(plate)
  }

  @Get("workshop-fleet")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getWorkshopFleet() {
    return this.vehiclesService.getWorkshopFleet()
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findAll(
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.vehiclesService.findAll(
      search,
      limit ? parseInt(limit, 10) : undefined,
      cursor,
    )
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findOne(@Param("id") id: string) {
    return this.vehiclesService.findOne(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto)
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto)
  }
}
