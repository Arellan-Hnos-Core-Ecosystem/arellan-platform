import { CanActivate, ExecutionContext } from "@nestjs/common";
export declare class MfaRequiredGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
