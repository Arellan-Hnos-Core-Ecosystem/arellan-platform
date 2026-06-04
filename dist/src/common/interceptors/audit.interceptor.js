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
var AuditInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_service_1 = require("../prisma/prisma.service");
const integrity_hash_service_1 = require("../crypto/integrity-hash.service");
const node_crypto_1 = require("node:crypto");
const SENSITIVE_FIELDS = [
    "password", "token", "mfaSecret", "passwordHash",
    "refreshToken", "accessToken", "secret", "pin", "ssn",
];
const FINANCIAL_KEYWORDS = [
    "payment", "pago", "transaction", "transaccion",
    "invoice", "factura", "billing", "facturacion",
    "refund", "reembolso", "charge", "cobro", "finance", "cashbox",
];
const CRITICAL_ROUTES = [
    "/api/v1/finance", "/api/v1/orders", "/api/v1/inventory",
    "/api/v1/purchases", "/api/v1/payments",
];
function fallbackSha256(payload) {
    return (0, node_crypto_1.createHmac)("sha256", "arellan-fallback-key-v3").update(payload).digest("hex");
}
let AuditInterceptor = AuditInterceptor_1 = class AuditInterceptor {
    prisma;
    integrityHash;
    logger = new common_1.Logger(AuditInterceptor_1.name);
    constructor(prisma, integrityHash) {
        this.prisma = prisma;
        this.integrityHash = integrityHash;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;
        const url = request.originalUrl ?? request.url;
        if (!user || ["GET", "HEAD", "OPTIONS"].includes(method)) {
            return next.handle();
        }
        const correlationId = request.headers["x-correlation-id"] ?? (0, node_crypto_1.randomUUID)();
        const beforeState = this.captureBeforeState(method, request);
        return next.handle().pipe((0, operators_1.tap)(async (responseBody) => {
            const action = this.buildAction(method, url);
            const severity = this.detectSeverity(method, action, url);
            const entity = this.extractEntity(url);
            const entityId = this.extractEntityId(request);
            const afterState = method === "POST"
                ? this.sanitize(request.body)
                : undefined;
            const mutationAction = this.toMutationAction(method);
            let integrityHash;
            try {
                integrityHash = this.integrityHash.generateMutationHash({
                    entity,
                    entityId: entityId ?? "unknown",
                    action: mutationAction,
                    before: beforeState ?? null,
                    after: afterState ?? null,
                });
            }
            catch {
                integrityHash = fallbackSha256(`${entity}:${entityId ?? "unknown"}:${mutationAction}:${correlationId}`);
            }
            const isCritical = this.isCriticalRoute(url);
            const timestamp = new Date().toISOString();
            try {
                await this.prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        userName: user.name || user.email,
                        role: user.role,
                        action,
                        entity,
                        entityId,
                        beforeState: (beforeState ?? undefined),
                        afterState: (afterState ?? undefined),
                        integrityHash,
                        ipAddress: request.ip || request.headers["x-forwarded-for"] || "unknown",
                        userAgent: request.headers["user-agent"] || undefined,
                        severity,
                        metadata: {
                            method,
                            path: url,
                            correlationId,
                            timestamp,
                            statusCode: responseBody?.statusCode ?? 200,
                            isCriticalRoute: isCritical,
                        },
                    },
                });
                if (isCritical && severity === "CRITICAL") {
                    this.logger.warn(`[AUDIT] CRITICAL mutation on ${url} by ${user.email ?? user.id} [${correlationId}]`);
                }
            }
            catch (err) {
                this.logger.error(`Audit log write failed: ${err.message}`);
            }
        }));
    }
    isCriticalRoute(url) {
        return CRITICAL_ROUTES.some((route) => url.toLowerCase().startsWith(route.toLowerCase()));
    }
    buildAction(method, url) {
        const entity = this.extractEntity(url).toUpperCase();
        switch (method) {
            case "POST": return `${entity}_CREATED`;
            case "PATCH":
            case "PUT": return `${entity}_UPDATED`;
            case "DELETE": return `${entity}_DELETED`;
            default: return `${entity}_MODIFIED`;
        }
    }
    detectSeverity(method, action, url) {
        if (url.toLowerCase().includes("force-logout"))
            return "SECURITY_ALERT";
        const isFinancial = FINANCIAL_KEYWORDS.some((k) => url.toLowerCase().includes(k) || action.toLowerCase().includes(k));
        if (isFinancial)
            return "CRITICAL";
        if (method === "DELETE" || action.includes("LOGOUT"))
            return "WARNING";
        if (action.includes("CANCEL"))
            return "WARNING";
        return "INFO";
    }
    captureBeforeState(method, request) {
        if (method === "PATCH" || method === "PUT")
            return this.sanitize(request.body);
        if (method === "DELETE") {
            const params = { ...request.params };
            return Object.keys(params).length > 0 ? this.sanitize(params) : undefined;
        }
        return undefined;
    }
    sanitize(obj) {
        if (!obj || typeof obj !== "object")
            return undefined;
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (SENSITIVE_FIELDS.some((f) => key.toLowerCase() === f.toLowerCase())) {
                sanitized[key] = "***REDACTED***";
            }
            else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.sanitize(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    extractEntity(url) {
        const parts = url.split("/").filter(Boolean);
        const apiIndex = parts.findIndex((p) => p === "api");
        return parts[apiIndex + 2] || "unknown";
    }
    extractEntityId(request) {
        return request.params?.id ?? undefined;
    }
    toMutationAction(method) {
        switch (method) {
            case "POST": return "CREATE";
            case "PATCH":
            case "PUT": return "UPDATE";
            case "DELETE": return "DELETE";
            default: return "UPDATE";
        }
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = AuditInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrity_hash_service_1.IntegrityHashService])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map