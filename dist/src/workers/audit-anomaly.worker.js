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
var AuditAnomalyWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAnomalyWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const realtime_gateway_1 = require("../common/gateway/realtime.gateway");
let AuditAnomalyWorker = AuditAnomalyWorker_1 = class AuditAnomalyWorker {
    prisma;
    realtimeGateway;
    logger = new common_1.Logger(AuditAnomalyWorker_1.name);
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async detectAnomalies() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const hour = new Date().getHours();
        if (hour < 7 || hour > 21) {
            const offHoursAccess = await this.prisma.auditLog.findMany({
                where: {
                    createdAt: { gte: oneHourAgo },
                    entity: { in: ["Finance", "CashboxSession", "Payment", "Invoice"] },
                },
            });
            if (offHoursAccess.length > 0) {
                this.realtimeGateway.emitSecurityAlert({
                    type: "OFF_HOURS_FINANCE_ACCESS",
                    description: `${offHoursAccess.length} acceso(s) al modulo financiero fuera de horario laboral`,
                    severity: "WARNING",
                });
            }
        }
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const rapidChanges = await this.prisma.auditLog.groupBy({
            by: ["userId"],
            where: {
                createdAt: { gte: fiveMinAgo },
                action: { in: ["PAYMENTS_CREATED", "FINANCE_CREATED", "CASHBOX_OPENED"] },
            },
            _count: true,
        });
        for (const change of rapidChanges) {
            if (change._count > 5) {
                this.realtimeGateway.emitSecurityAlert({
                    type: "RAPID_FINANCE_CHANGES",
                    description: `Usuario ${change.userId} realizo ${change._count} cambios financieros en 5 minutos`,
                    severity: "CRITICAL",
                    userId: change.userId,
                });
            }
        }
    }
};
exports.AuditAnomalyWorker = AuditAnomalyWorker;
__decorate([
    (0, schedule_1.Cron)("0 * * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditAnomalyWorker.prototype, "detectAnomalies", null);
exports.AuditAnomalyWorker = AuditAnomalyWorker = AuditAnomalyWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], AuditAnomalyWorker);
//# sourceMappingURL=audit-anomaly.worker.js.map