import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { QuotesService } from "./quotes.service"
import {
  QuoteFilterDto,
  CreateQuoteDto,
  RejectQuoteDto,
} from "./dto/quotes.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { AuthUser } from "../auth/auth.service"
import { UserRole } from "@prisma/client"

@Controller("quotes")
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findAll(@Query() filters: QuoteFilterDto) {
    return this.quotesService.findAll(filters)
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.FINANCE)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.quotesService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  create(@Body() dto: CreateQuoteDto, @CurrentUser() user: AuthUser) {
    return this.quotesService.create(dto, user.id)
  }

  @Post(":id/approve")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  approve(@Param("id") id: string) {
    return this.quotesService.approve(id)
  }

  @Post(":id/reject")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  reject(@Param("id") id: string, @Body() dto: RejectQuoteDto) {
    return this.quotesService.reject(id, dto.reason)
  }

  @Post(":id/convert")
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(RolesGuard)
  convertToOrder(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.quotesService.convertToOrder(id, user.id)
  }
}
