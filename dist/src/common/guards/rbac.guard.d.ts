import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
export declare const PERMISSIONS_KEY = "rbac:permissions";
export declare enum PermissionAction {
    READ = "READ",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    APPROVE = "APPROVE",
    FINANCIAL_EXPORT = "FINANCIAL_EXPORT",
    MANAGE_PERSONNEL = "MANAGE_PERSONNEL",
    VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
    MANAGE_SETTINGS = "MANAGE_SETTINGS"
}
export declare const RequirePermissions: (...permissions: PermissionAction[]) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare class RbacGuard implements CanActivate {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
