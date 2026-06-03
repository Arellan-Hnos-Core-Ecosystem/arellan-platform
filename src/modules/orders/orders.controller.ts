import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from "@nestjs/common"
import { OrdersService } from "./orders.service"
import { AuthUser } from "../auth/auth.service"
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto } from "./dto/orders.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole, OrderStatus } from "@prisma/client"

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query() filters: OrderFilterDto) {
    return this.ordersService.findAll(filters)
  }

  @Get("my")
  @Roles(UserRole.MECHANIC)
  @UseGuards(RolesGuard)
  findMyOrders(
    @CurrentUser() user: AuthUser,
    @Query() filters: OrderFilterDto,
  ) {
    return this.ordersService.findByMechanic(user.id, filters)
  }

  @Get("stats/summary")
  getSummaryStats() {
    return this.ordersService.getSummaryStats()
  }

  @Get("by-status/:status")
  findByStatus(@Param("status") status: string) {
    return this.ordersService.findAll({ status: status as OrderStatus })
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(id)
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto)
  }

  @Patch(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto)
  }

  @Post(":id/status")
  @Roles(UserRole.MECHANIC, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.updateStatus(id, dto, user.id)
  }

  @Delete(":id")
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  remove(@Param("id") id: string) {
    return this.ordersService.softDelete(id)
  }
}
