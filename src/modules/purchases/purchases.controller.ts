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
import { PurchasesService } from "./purchases.service"
import {
  PurchaseFilterDto,
  CreatePurchaseDto,
  UpdatePurchaseStatusDto,
  ReceiveItemsDto,
} from "./dto/purchases.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("purchases")
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: PurchaseFilterDto) {
    return this.purchasesService.findAll(filters)
  }

  @Get("imports")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getImports() {
    return this.purchasesService.getImports()
  }

  @Get("supplier/:supplierId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getBySupplier(@Param("supplierId") supplierId: string) {
    return this.purchasesService.getBySupplier(supplierId)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.purchasesService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreatePurchaseDto, @CurrentUser() user: AuthUser) {
    return this.purchasesService.create(dto, user.id)
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdatePurchaseStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchasesService.updateStatus(id, dto.status, user.id)
  }

  @Post(":id/receive")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  receiveItems(
    @Param("id") id: string,
    @Body() dto: ReceiveItemsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchasesService.receiveItems(id, dto, user.id)
  }
}
