import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { CommissionsService } from "./commissions.service"
import {
  CommissionFilterDto,
  CreateCommissionDto,
  ApproveCommissionDto,
} from "./dto/commissions.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("commissions")
@UseGuards(JwtAuthGuard)
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: CommissionFilterDto) {
    return this.commissionsService.findAll(filters)
  }

  @Get("personnel/:personnelId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getByPersonnel(@Param("personnelId") personnelId: string) {
    return this.commissionsService.getByPersonnel(personnelId)
  }

  @Get("supplier/:supplierId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getBySupplier(@Param("supplierId") supplierId: string) {
    return this.commissionsService.getBySupplier(supplierId)
  }

  @Post()
  @Roles(UserRole.OWNER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateCommissionDto, @CurrentUser() user: AuthUser) {
    return this.commissionsService.create(dto, user.role, user.id)
  }

  @Post(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  approve(@Param("id") id: string, @Body() dto: ApproveCommissionDto) {
    return this.commissionsService.approve(id, dto.approverId)
  }

  @Post(":id/pay")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  pay(@Param("id") id: string) {
    return this.commissionsService.pay(id)
  }
}
