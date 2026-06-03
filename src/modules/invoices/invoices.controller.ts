import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { InvoicesService } from "./invoices.service"
import {
  InvoiceFilterDto,
  CreateInvoiceDto,
  CancelInvoiceDto,
} from "./dto/invoices.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("invoices")
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: InvoiceFilterDto) {
    return this.invoicesService.findAll(filters)
  }

  @Get("overdue")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getOverdue() {
    return this.invoicesService.getOverdue()
  }

  @Get("client/:clientId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  getByClient(@Param("clientId") clientId: string) {
    return this.invoicesService.getByClient(clientId)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id)
  }

  @Post("from-order/:orderId")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  createFromOrder(@Param("orderId") orderId: string, @CurrentUser() user: AuthUser) {
    return this.invoicesService.createFromOrder(orderId, user.id)
  }

  @Post(":id/issue")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  issue(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.invoicesService.issue(id, user.id)
  }

  @Post(":id/cancel")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  cancel(@Param("id") id: string, @Body() dto: CancelInvoiceDto) {
    return this.invoicesService.cancel(id, dto.reason)
  }
}
