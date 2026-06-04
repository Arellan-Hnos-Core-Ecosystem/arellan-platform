"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AntiFraudMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiFraudMiddleware = void 0;
const common_1 = require("@nestjs/common");
const anti_fraud_service_1 = require("./anti-fraud.service");
let AntiFraudMiddleware = AntiFraudMiddleware_1 = class AntiFraudMiddleware {
    antiFraudService;
    logger = new common_1.Logger(AntiFraudMiddleware_1.name);
    constructor(antiFraudService) {
        this.antiFraudService = antiFraudService;
    }
    async use(req, _res, next) {
        const user = req.user;
        const method = req.method;
        const url = String(req.originalUrl ?? req.url);
        const ip = req.ip ?? "unknown";
        const params = req.params;
        if (!user || ["GET", "HEAD", "OPTIONS"].includes(method)) {
            next();
            return;
        }
        const ctx = {
            userId: String(user.id ?? "unknown"),
            userRole: String(user.role ?? "unknown"),
            ipAddress: ip,
            method,
            url,
            body: (req.body ?? undefined),
            action: method === "POST" ? "CREATED" : method === "DELETE" ? "DELETED" : "UPDATED",
            entity: this.extractEntity(url),
            entityId: params.id ?? undefined,
        };
        this.antiFraudService.audit(ctx).catch((err) => {
            this.logger.error(`AntiFraud audit failed: ${err.message}`);
        });
        next();
    }
    extractEntity(url) {
        const parts = url.split("/").filter(Boolean);
        const apiIndex = parts.findIndex((p) => p === "api");
        return parts[apiIndex + 2] || "unknown";
    }
};
exports.AntiFraudMiddleware = AntiFraudMiddleware;
exports.AntiFraudMiddleware = AntiFraudMiddleware = AntiFraudMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [anti_fraud_service_1.AntiFraudService])
], AntiFraudMiddleware);
//# sourceMappingURL=anti-fraud.middleware.js.map