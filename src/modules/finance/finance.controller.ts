import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common"
import { FinanceService } from "./finance.service"
import { AuthUser } from "../auth/auth.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { MfaRequiredGuard } from "../../common/guards/mfa-required.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole } from "@prisma/client"
import {
  OpenCashboxDto,
  CloseCashboxDto,
  CreateTransactionDto,
  CreateExpenseDto,
  ApproveExpenseDto,
  ExpenseFiltersDto,
} from "./dto/finance.dto"

@Controller("finance")
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post("cashbox/open")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  openCashbox(@CurrentUser() user: AuthUser, @Body() dto: OpenCashboxDto) {
    return this.financeService.openCashbox(user.id, dto)
  }

  @Post("cashbox/close")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  closeCashbox(@CurrentUser() user: AuthUser, @Body() dto: CloseCashboxDto) {
    return this.financeService.closeCashbox(user.id, dto)
  }

  @Get("cashbox/today")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.OWNER)
  getTodaySession() {
    return this.financeService.getTodaySession()
  }

  @Post("cashbox/transactions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  addTransaction(@Body() dto: CreateTransactionDto, @Query("sessionId") sessionId: string) {
    return this.financeService.addTransaction(sessionId, dto)
  }

  @Post("expenses")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  createExpense(@CurrentUser() user: AuthUser, @Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(user.id, dto)
  }

  @Get("expenses/pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  getPendingExpenses(@CurrentUser() user: AuthUser) {
    return this.financeService.getPendingExpenses(user.id)
  }

  @Post("expenses/:id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  approveExpense(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: ApproveExpenseDto,
  ) {
    return this.financeService.approveExpense(id, user.id, dto)
  }

  @Get("expenses")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FINANCE, UserRole.ADMIN, UserRole.OWNER)
  getExpenses(@Query() filters: ExpenseFiltersDto) {
    return this.financeService.getExpenses(filters)
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  getDashboard(@Query("period") period: "day" | "week" | "month" = "month") {
    return this.financeService.getDashboard(period)
  }

  @Get("cashflow")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.FINANCE)
  getCashflow(
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.financeService.getCashflow(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    )
  }

  @Get("cashbox/history")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.FINANCE)
  getCashboxHistory(
    @Query("limit") limit?: number,
    @Query("cursor") cursor?: string,
  ) {
    return this.financeService.getCashboxHistory(limit, cursor)
  }

  @Get("commissions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE)
  getCommissions(
    @Query("status") status?: string,
    @Query("personnelId") personnelId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.financeService.getCommissions({
      status,
      personnelId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }
}
