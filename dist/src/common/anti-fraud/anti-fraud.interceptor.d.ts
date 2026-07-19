import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { AntiFraudService } from "./anti-fraud.service";
export declare class AntiFraudInterceptor implements NestInterceptor {
    private readonly antiFraudService;
    private readonly logger;
    constructor(antiFraudService: AntiFraudService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private static extractEntity;
}
