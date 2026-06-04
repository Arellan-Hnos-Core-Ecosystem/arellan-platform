import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AntiFraudService } from "./anti-fraud.service";
export declare class AntiFraudMiddleware implements NestMiddleware {
    private readonly antiFraudService;
    private readonly logger;
    constructor(antiFraudService: AntiFraudService);
    use(req: Request, _res: Response, next: NextFunction): Promise<void>;
    private extractEntity;
}
