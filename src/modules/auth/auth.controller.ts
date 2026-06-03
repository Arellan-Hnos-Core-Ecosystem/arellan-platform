import { Controller, Post, Get, Delete, Body, Param, Req, UseGuards } from "@nestjs/common"
import { AuthService, AuthUser } from "./auth.service"
import { LoginDto, MfaVerifyDto, RegisterDto, ChangePasswordDto, ForceLogoutDto } from "./dto/auth.dto"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { CurrentUser } from "../../common/decorators/current-user.decorator"
import { UserRole } from "@prisma/client"

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.socket?.remoteAddress || "unknown"
    const userAgent = req.headers?.["user-agent"]
    return this.authService.login(dto, ip, userAgent)
  }

  @Post("mfa/verify")
  verifyMfa(@Body() dto: MfaVerifyDto) {
    return this.authService.verifyMfa(dto)
  }

  @Post("register")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get("mfa/generate")
  @UseGuards(JwtAuthGuard)
  generateMfa(@CurrentUser() user: AuthUser) {
    return this.authService.generateMfaSecret(user.id)
  }

  @Post("mfa/confirm")
  @UseGuards(JwtAuthGuard)
  confirmMfa(@CurrentUser() user: AuthUser, @Body("token") token: string) {
    return this.authService.confirmMfaSetup(user.id, token)
  }

  @Post("refresh")
  refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken)
  }

  @Delete("logout")
  logout(@Body("refreshToken") refreshToken: string) {
    return this.authService.logout(refreshToken)
  }

  @Post("logout-all")
  @UseGuards(JwtAuthGuard)
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.authService.logoutAll(user.id)
  }

  @Get("sessions")
  @UseGuards(JwtAuthGuard)
  getSessions(@CurrentUser() user: AuthUser) {
    return this.authService.getSessions(user.id)
  }

  @Delete("sessions/:id")
  @UseGuards(JwtAuthGuard)
  revokeSession(@Param("id") sessionId: string, @CurrentUser() user: AuthUser) {
    return this.authService.revokeSession(sessionId, user.id)
  }

  @Post("force-logout")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  forceLogout(@Body() dto: ForceLogoutDto, @CurrentUser() user: AuthUser) {
    return this.authService.forceLogoutUser(dto.userId, user.id)
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto)
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id)
  }
}
