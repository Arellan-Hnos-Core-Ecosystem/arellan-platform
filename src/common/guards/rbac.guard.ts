import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { UserRole } from "@prisma/client"

export const PERMISSIONS_KEY = "rbac:permissions"

export enum PermissionAction {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  APPROVE = "APPROVE",
  FINANCIAL_EXPORT = "FINANCIAL_EXPORT",
  MANAGE_PERSONNEL = "MANAGE_PERSONNEL",
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
  MANAGE_SETTINGS = "MANAGE_SETTINGS",
}

const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  OWNER: Object.values(PermissionAction),
  ADMIN: [
    PermissionAction.READ,
    PermissionAction.CREATE,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.APPROVE,
    PermissionAction.MANAGE_PERSONNEL,
  ],
  FINANCE: [
    PermissionAction.READ,
    PermissionAction.CREATE,
    PermissionAction.UPDATE,
    PermissionAction.APPROVE,
    PermissionAction.FINANCIAL_EXPORT,
  ],
  MECHANIC: [
    PermissionAction.READ,
    PermissionAction.CREATE,
    PermissionAction.UPDATE,
  ],
  TRAINEE: [
    PermissionAction.READ,
    PermissionAction.CREATE,
  ],
  CLIENT: [
    PermissionAction.READ,
  ],
}

export const RequirePermissions = (...permissions: PermissionAction[]) =>
  Reflect.metadata(PERMISSIONS_KEY, permissions)

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionAction[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()

    if (!user) {
      throw new ForbiddenException({
        message: "No autenticado",
        code: "UNAUTHENTICATED",
      })
    }

    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole] || []

    const hasAllPermissions = requiredPermissions.every((p) =>
      userPermissions.includes(p),
    )

    if (!hasAllPermissions) {
      throw new ForbiddenException({
        message: `Permisos insuficientes. Tu rol (${user.role}) no permite esta acción.`,
        code: "INSUFFICIENT_PERMISSIONS",
        required: requiredPermissions,
        granted: userPermissions,
      })
    }

    return true
  }
}
