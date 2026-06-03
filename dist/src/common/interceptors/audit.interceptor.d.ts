import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
export declare class AuditInterceptor implements NestInterceptor {
    private readonly prisma?;
    constructor(prisma?: PrismaService | undefined);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private buildAction;
    private extractEntity;
}
