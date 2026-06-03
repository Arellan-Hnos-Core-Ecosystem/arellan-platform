import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { PaymentsService } from "./payments.service"
import {
  PaymentFilterDto,
  CreatePaymentDto,
  VerifyPaymentDto,
} from "./dto/payments.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole, PaymentMethod } from "@prisma/client"

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: PaymentFilterDto) {
    return this.paymentsService.findAll(filters)
  }

  @Get("today")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getTodaySummary() {
    return this.paymentsService.getTodaySummary()
  }

  @Get("method")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getByMethod(
    @Query("method") method: PaymentMethod,
    @Query("from") from: string,
    @Query("to") to: string,
  ) {
    return this.paymentsService.getByMethod(method, from, to)
  }

  @Get("order/:orderId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getByOrder(@Param("orderId") orderId: string) {
    return this.paymentsService.getByOrder(orderId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.create(dto, user.id)
  }

  @Post(":id/verify")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  verify(@Param("id") id: string, @Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verify(id, dto.verifierId)
  }
}
