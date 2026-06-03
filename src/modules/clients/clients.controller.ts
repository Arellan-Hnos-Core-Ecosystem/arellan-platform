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
import { ClientsService } from "./clients.service"
import { CreateClientDto, UpdateClientDto } from "./dto/clients.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"

@Controller("clients")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.clientsService.findAll(
      search,
      limit ? parseInt(limit, 10) : undefined,
      cursor,
    )
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clientsService.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto)
  }

  @Get(":id/history")
  getHistory(@Param("id") id: string) {
    return this.clientsService.getHistory(id)
  }
}
