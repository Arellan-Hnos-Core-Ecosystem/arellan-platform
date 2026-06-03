import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common"
import { UserRole } from "@prisma/client"

const MFA_REQUIRED_ROLES: UserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.FINANCE]

@Injectable()
export class MfaRequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      throw new ForbiddenException("No autenticado")
    }

    if (MFA_REQUIRED_ROLES.includes(user.role) && !user.mfaVerified) {
      throw new ForbiddenException({
        message: "MFA requerida para este rol",
        code: "MFA_REQUIRED",
      })
    }

    return true
  }
}
