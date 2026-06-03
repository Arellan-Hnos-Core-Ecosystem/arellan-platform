import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common"
import { AuditService } from "./audit.service"
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard"
import { RolesGuard } from "../../common/guards/roles.guard"
import { MfaRequiredGuard } from "../../common/guards/mfa-required.guard"
import { Roles } from "../../common/decorators/roles.decorator"
import { UserRole } from "@prisma/client"
import { AuditFilterDto } from "./dto/audit.dto"

@Controller("audit")
@UseGuards(JwtAuthGuard, RolesGuard, MfaRequiredGuard)
@Roles(UserRole.ADMIN, UserRole.OWNER)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() filters: AuditFilterDto) {
    return this.auditService.findAll(filters)
  }

  @Get("user/:userId")
  getByUser(
    @Param("userId") userId: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.auditService.getByUser(
      userId,
      limit ? parseInt(limit) : undefined,
      cursor,
    )
  }

  @Get("entity/:entity/:entityId")
  getByEntity(
    @Param("entity") entity: string,
    @Param("entityId") entityId: string,
    @Query("limit") limit?: string,
    @Query("cursor") cursor?: string,
  ) {
    return this.auditService.getByEntity(
      entity,
      entityId,
      limit ? parseInt(limit) : undefined,
      cursor,
    )
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.auditService.findOne(id)
  }
}
