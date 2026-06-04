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
import { InventoryService } from "./inventory.service"
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("inventory")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get("movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  getAllMovements(
    @Query("itemId") itemId?: string,
    @Query("type") type?: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.inventoryService.getAllMovements(
      itemId,
      type,
      limit ? parseInt(limit, 10) : undefined,
      cursor,
    )
  }

  @Get("critical/list")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  getCriticalStock() {
    return this.inventoryService.getCriticalStock()
  }

  @Get("low-stock")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  getLowStock() {
    return this.inventoryService.getCriticalStock()
  }

  @Get("valuation")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  getValuation() {
    return this.inventoryService.getValuation()
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  findAll(
    @Query("category") category?: string,
    @Query("lowStock") lowStock?: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.inventoryService.findAll(
      category,
      lowStock === "true",
      limit ? parseInt(limit, 10) : undefined,
      cursor,
    )
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  findOne(@Param("id") id: string) {
    return this.inventoryService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  create(@Body() dto: CreateItemDto) {
    return this.inventoryService.create(dto)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  update(@Param("id") id: string, @Body() dto: UpdateItemDto) {
    return this.inventoryService.update(id, dto)
  }

  @Post(":id/movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  addMovement(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: InventoryMovementDto,
  ) {
    return this.inventoryService.addMovement(user.id, id, dto)
  }

  @Get(":id/movements")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getMovements(
    @Param("id") id: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.inventoryService.getMovements(
      id,
      limit ? parseInt(limit, 10) : undefined,
      cursor,
    )
  }

  @Post(":id/reserve")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MECHANIC)
  reserveForOrder(
    @Param("id") itemId: string,
    @Body() body: { quantity: number; workOrderId: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventoryService.reserveForOrder(
      itemId,
      body.quantity,
      body.workOrderId,
      user.id,
    )
  }
}
