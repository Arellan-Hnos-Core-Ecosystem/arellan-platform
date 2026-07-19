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
var AntiFraudService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntiFraudService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const integrity_hash_service_1 = require("../crypto/integrity-hash.service");
const node_crypto_1 = require("node:crypto");
const YAPE_KEYWORDS = ["yape", "plin", "personal", "personal_yape", "numero_personal"];
const INVENTORY_MANIPULATION_PATTERNS = ["ADJUSTMENT", "write_off", "merma", "perdida"];
const HIGH_VALUE_THRESHOLD = 500;
let AntiFraudService = AntiFraudService_1 = class AntiFraudService {
    prisma;
    integrityHash;
    logger = new common_1.Logger(AntiFraudService_1.name);
    constructor(prisma, integrityHash) {
        this.prisma = prisma;
        this.integrityHash = integrityHash;
    }
    async audit(ctx) {
        const alerts = [];
        alerts.push(...this.checkYapeDiversion(ctx));
        alerts.push(...this.checkInventoryManipulation(ctx));
        alerts.push(...this.checkHighValueMutation(ctx));
        alerts.push(...this.checkSuspiciousAccessPattern(ctx));
        for (const alert of alerts) {
            await this.persistAlert(alert, ctx);
        }
        if (alerts.length > 0) {
            this.logger.warn(`[ANTI-FRAUD] ${alerts.length} alert(s) generated for ${ctx.userId} on ${ctx.action}`);
        }
        return alerts;
    }
    checkYapeDiversion(ctx) {
        const alerts = [];
        const body = ctx.body ?? {};
        const bodyStr = JSON.stringify(body).toLowerCase();
        if (!YAPE_KEYWORDS.some((kw) => bodyStr.includes(kw)))
            return alerts;
        const isPersonalYape = body.isPersonalYape === true ||
            (typeof body.yapeAccount === "string" && body.yapeAccount.length > 0);
        if (isPersonalYape) {
            alerts.push(this.buildAlert(ctx, {
                type: "YAPE_DIVERSION",
                severity: "CRITICAL",
                description: "Pago recibido en cuenta Yape personal detectado",
                details: {
                    yapeAccount: body.yapeAccount ?? "no especificado",
                    amount: body.amount ?? "no especificado",
                    orderId: body.orderId ?? body.workOrderId ?? "no especificado",
                },
            }));
        }
        return alerts;
    }
    checkInventoryManipulation(ctx) {
        const alerts = [];
        const body = ctx.body ?? {};
        if (ctx.entity !== "inventory" && ctx.entity !== "inventory-item")
            return alerts;
        const justification = body.justification;
        const isAdjustment = body.type === "ADJUSTMENT" ||
            (typeof justification === "string" &&
                INVENTORY_MANIPULATION_PATTERNS.some((p) => justification.toLowerCase().includes(p)));
        if (isAdjustment) {
            alerts.push(this.buildAlert(ctx, {
                type: "INVENTORY_MANIPULATION",
                severity: "HIGH",
                description: "Ajuste de inventario detectado - posible manipulacion",
                details: {
                    itemId: body.itemId ?? "no especificado",
                    quantity: body.quantity ?? "no especificado",
                    justification: body.justification ?? "no especificado",
                    type: body.type ?? "no especificado",
                },
            }));
        }
        return alerts;
    }
    checkHighValueMutation(ctx) {
        const alerts = [];
        const body = ctx.body ?? {};
        const amount = Number(body.amount ?? 0);
        if (amount <= HIGH_VALUE_THRESHOLD)
            return alerts;
        const isExpenseApproval = ctx.url.includes("expense") || ctx.url.includes("gasto");
        const isPayment = ctx.url.includes("payment") || ctx.url.includes("pago");
        if (isExpenseApproval || isPayment) {
            alerts.push(this.buildAlert(ctx, {
                type: "HIGH_VALUE_MUTATION",
                severity: "MEDIUM",
                description: `Mutacion financiera de alto valor: S/ ${amount.toFixed(2)}`,
                details: {
                    amount,
                    entity: ctx.entity,
                    action: ctx.action,
                    currency: body.currency ?? "PEN",
                },
            }));
        }
        return alerts;
    }
    checkSuspiciousAccessPattern(ctx) {
        const alerts = [];
        const restrictedEndpoints = ["force-logout", "delete", "hard-delete", "purge"];
        if (restrictedEndpoints.some((ep) => ctx.url.toLowerCase().includes(ep))) {
            alerts.push(this.buildAlert(ctx, {
                type: "RESTRICTED_ACCESS",
                severity: "HIGH",
                description: "Acceso a endpoint restringido detectado",
                details: { url: ctx.url, method: ctx.method },
            }));
        }
        return alerts;
    }
    async persistAlert(alert, ctx) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: ctx.userId,
                    userName: ctx.userName ?? ctx.userId,
                    role: ctx.userRole,
                    action: `FRAUD_${alert.type}`,
                    entity: ctx.entity,
                    entityId: ctx.entityId,
                    severity: alert.severity === "CRITICAL" || alert.severity === "HIGH"
                        ? "SECURITY_ALERT"
                        : alert.severity === "MEDIUM"
                            ? "WARNING"
                            : "INFO",
                    ipAddress: ctx.ipAddress,
                    metadata: {
                        alertId: alert.id,
                        timestamp: alert.timestamp,
                        type: alert.type,
                        description: alert.description,
                        details: alert.details,
                        correlationId: (0, node_crypto_1.randomUUID)(),
                        immutableHash: alert.immutableHash,
                    },
                    integrityHash: alert.immutableHash,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to persist fraud alert: ${err.message}`);
        }
    }
    buildAlert(ctx, overrides) {
        const id = (0, node_crypto_1.randomUUID)();
        const timestamp = new Date().toISOString();
        const immutableHash = this.integrityHash.generateMutationHash({
            entity: ctx.entity,
            entityId: ctx.entityId ?? "unknown",
            action: "CREATE",
            before: null,
            after: { alertId: id, type: overrides.type, timestamp },
        });
        return {
            id,
            type: overrides.type ?? "UNKNOWN",
            severity: overrides.severity ?? "LOW",
            description: overrides.description ?? "Alerta de fraude generada",
            details: overrides.details ?? {},
            timestamp,
            userId: ctx.userId,
            ipAddress: ctx.ipAddress,
            immutableHash,
        };
    }
};
exports.AntiFraudService = AntiFraudService;
exports.AntiFraudService = AntiFraudService = AntiFraudService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        integrity_hash_service_1.IntegrityHashService])
], AntiFraudService);
//# sourceMappingURL=anti-fraud.service.js.map