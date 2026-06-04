import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { PrismaService } from "../prisma/prisma.service";
import { IntegrityHashService } from "../crypto/integrity-hash.service";
export declare class AuditInterceptor implements NestInterceptor {
    private readonly prisma;
    private readonly integrityHash;
    private readonly logger;
    constructor(prisma: PrismaService, integrityHash: IntegrityHashService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private isCriticalRoute;
    private buildAction;
    private detectSeverity;
    private captureBeforeState;
    private sanitize;
    private extractEntity;
    private extractEntityId;
    private toMutationAction;
}
