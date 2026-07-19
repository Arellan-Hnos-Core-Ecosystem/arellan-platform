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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseCashboxSessionUseCase = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const event_emitter_1 = require("@nestjs/event-emitter");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const realtime_gateway_1 = require("../../../common/gateway/realtime.gateway");
const client_1 = require("@prisma/client");
const queue_names_enum_1 = require("../../../queues/queue-names.enum");
const DISCREPANCY_MINOR = 5;
const DISCREPANCY_MAJOR = 50;
let CloseCashboxSessionUseCase = class CloseCashboxSessionUseCase {
    prisma;
    wsGateway;
    eventEmitter;
    alertQueue;
    constructor(prisma, wsGateway, eventEmitter, alertQueue) {
        this.prisma = prisma;
        this.wsGateway = wsGateway;
        this.eventEmitter = eventEmitter;
        this.alertQueue = alertQueue;
    }
    async execute(userId, params) {
        const session = await this.prisma.cashboxSession.findFirst({
            where: { status: "OPEN" },
            include: { transactions: true },
        });
        if (!session)
            throw new common_1.NotFoundException("No hay sesión de caja abierta para cerrar");
        const paymentSum = session.transactions
            .filter((t) => t.type === client_1.TransactionType.PAYMENT)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expenseSum = session.transactions
            .filter((t) => t.type === client_1.TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expected = Number(session.openingBalance) + paymentSum - expenseSum;
        const rawDiff = params.actualCash - expected;
        const absDiff = Math.abs(rawDiff);
        let newStatus;
        if (absDiff < DISCREPANCY_MINOR) {
            newStatus = "CLOSED_NORMAL";
        }
        else if (absDiff <= DISCREPANCY_MAJOR) {
            if (!params.justificationText?.trim()) {
                throw new common_1.BadRequestException({
                    statusCode: 400,
                    error: "JUSTIFICATION_REQUIRED",
                    message: `Descuadre de S/ ${absDiff.toFixed(2)} requiere justificación obligatoria.`,
                });
            }
            newStatus = "CLOSED_WITH_DISCREPANCY";
        }
        else {
            newStatus = "BLOCKED";
            await this.prisma.auditLog.create({
                data: {
                    userId,
                    userName: "system",
                    role: "ADMIN",
                    action: "CASHBOX_BLOCKED_MAJOR_DISCREPANCY",
                    entity: "CashboxSession",
                    entityId: session.id,
                    severity: "CRITICAL",
                    ipAddress: "system",
                    metadata: {
                        discrepancy: rawDiff,
                        absDiff,
                        expected,
                        actual: params.actualCash,
                        sessionId: session.id,
                    },
                },
            });
            await this.alertQueue.add("cashbox-blocked", {
                type: "CASHBOX_BLOCKED",
                sessionId: session.id,
                discrepancy: rawDiff.toFixed(2),
                expected: expected.toFixed(2),
                actual: params.actualCash.toFixed(2),
                closedBy: userId,
                timestamp: new Date().toISOString(),
            }, { priority: 1 });
            this.wsGateway.emitAnomalyDetected({
                type: "CASHBOX_BLOCKED",
                description: `Caja bloqueada: descuadre de S/ ${absDiff.toFixed(2)} supera el límite de S/ ${DISCREPANCY_MAJOR}. Requiere override del OWNER.`,
                severity: "CRITICAL",
                sessionId: session.id,
                userId,
            });
        }
        const _closed = await this.prisma.cashboxSession.update({
            where: { id: session.id },
            data: {
                status: newStatus,
                closedById: userId,
                actualCash: params.actualCash,
                closingBalance: expected,
                discrepancy: rawDiff,
                justificationText: params.justificationText ?? null,
                ...(newStatus !== "BLOCKED" ? { closedAt: new Date() } : {}),
            },
        });
        if (newStatus !== "BLOCKED") {
            this.eventEmitter.emit("cashbox.closed", { sessionId: session.id, status: newStatus });
            this.wsGateway.emitCashboxClosed({ sessionId: session.id, status: newStatus, closedBy: userId });
        }
        return {
            success: true,
            sessionId: session.id,
            status: newStatus,
            expected,
            actual: params.actualCash,
            discrepancy: rawDiff,
            blocked: newStatus === "BLOCKED",
        };
    }
};
exports.CloseCashboxSessionUseCase = CloseCashboxSessionUseCase;
exports.CloseCashboxSessionUseCase = CloseCashboxSessionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bullmq_1.InjectQueue)(queue_names_enum_1.QueueName.ALERT_DISPATCHER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        event_emitter_1.EventEmitter2,
        bullmq_2.Queue])
], CloseCashboxSessionUseCase);
//# sourceMappingURL=close-cashbox-session.use-case.js.map