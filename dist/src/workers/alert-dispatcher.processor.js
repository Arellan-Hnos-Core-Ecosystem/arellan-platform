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
var AlertDispatcherProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertDispatcherProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const realtime_gateway_1 = require("../common/gateway/realtime.gateway");
let AlertDispatcherProcessor = AlertDispatcherProcessor_1 = class AlertDispatcherProcessor extends bullmq_1.WorkerHost {
    realtimeGateway;
    logger = new common_1.Logger(AlertDispatcherProcessor_1.name);
    constructor(realtimeGateway) {
        super();
        this.realtimeGateway = realtimeGateway;
    }
    async process(job) {
        const data = job.data;
        switch (job.name) {
            case "cashbox-discrepancy": {
                const p = data;
                this.realtimeGateway.emitAnomalyDetected({
                    type: "CASHBOX_DISCREPANCY",
                    description: `Discrepancia de caja S/.${p.discrepancy} detectada (esperado: S/.${p.expected}, real: S/.${p.actual})`,
                    severity: "CRITICAL",
                    sessionId: p.sessionId,
                    userId: p.userId,
                });
                this.logger.error(`Anomalia de caja: sesion ${p.sessionId}, discrepancia S/.${p.discrepancy}`);
                break;
            }
            case "expense-approval-required": {
                const p = data;
                this.realtimeGateway.emitApprovalRequested({
                    approvalId: p.expenseId,
                    type: "EXPENSE",
                    amount: p.amount,
                    requestedBy: p.requesterId,
                });
                break;
            }
            case "suspicious-expense": {
                const p = data;
                this.realtimeGateway.emitSecurityAlert({
                    type: "SUSPICIOUS_EXPENSE",
                    description: `Gasto sospechoso de S/.${p.amount} en categoria ${p.category} solicitado por ${p.requesterId}`,
                    severity: "WARNING",
                    userId: p.requesterId,
                });
                break;
            }
            case "expense-disbursed": {
                const p = data;
                this.realtimeGateway.emitApprovalResolved({
                    approvalId: p.expenseId,
                    status: "DISBURSED",
                    resolvedBy: "system",
                });
                break;
            }
            default:
                this.logger.warn(`AlertDispatcherProcessor: unhandled job name "${job.name}"`);
        }
    }
    onFailed(job, error) {
        this.logger.error(`Alert dispatch failed for job ${job.id} (${job.name}) after ${job.attemptsMade} attempts: ${error.message}`);
    }
};
exports.AlertDispatcherProcessor = AlertDispatcherProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)("failed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], AlertDispatcherProcessor.prototype, "onFailed", null);
exports.AlertDispatcherProcessor = AlertDispatcherProcessor = AlertDispatcherProcessor_1 = __decorate([
    (0, bullmq_1.Processor)("alert-dispatcher"),
    __metadata("design:paramtypes", [realtime_gateway_1.RealtimeGateway])
], AlertDispatcherProcessor);
//# sourceMappingURL=alert-dispatcher.processor.js.map