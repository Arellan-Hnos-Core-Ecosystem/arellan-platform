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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrityHashService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("node:crypto");
let IntegrityHashService = class IntegrityHashService {
    config;
    secretKey;
    constructor(config) {
        this.config = config;
        const raw = this.config.getOrThrow("INTEGRITY_HASH_SECRET");
        this.secretKey = crypto.scryptSync(raw, "arellan-salt-v2", 32);
    }
    generateMutationHash(params) {
        const canonical = JSON.stringify({
            e: params.entity,
            id: params.entityId,
            a: params.action,
            b: params.before ?? null,
            f: params.after ?? null,
        }, Object.keys({ ...params.before, ...params.after }).sort());
        return crypto.createHmac("sha256", this.secretKey).update(canonical).digest("hex");
    }
    verifyAuditLogIntegrity(log) {
        const expected = this.generateMutationHash({
            entity: log.entity,
            entityId: log.entityId,
            action: log.action,
            before: log.beforeState,
            after: log.afterState,
        });
        return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(log.integrityHash, "hex"));
    }
    generatePaymentHash(params) {
        const payload = `${params.orderId}:${params.amount}:${params.method}:${params.referenceToken ?? "CASH"}`;
        return crypto.createHmac("sha256", this.secretKey).update(payload).digest("hex");
    }
};
exports.IntegrityHashService = IntegrityHashService;
exports.IntegrityHashService = IntegrityHashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IntegrityHashService);
//# sourceMappingURL=integrity-hash.service.js.map