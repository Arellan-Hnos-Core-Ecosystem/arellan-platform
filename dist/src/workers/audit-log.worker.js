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
var AuditLogWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
let AuditLogWorker = AuditLogWorker_1 = class AuditLogWorker extends bullmq_1.WorkerHost {
    prisma;
    logger = new common_1.Logger(AuditLogWorker_1.name);
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    async process(job) {
        const data = job.data;
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    userName: data.userName,
                    role: data.role,
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    beforeState: data.beforeState,
                    afterState: data.afterState,
                    integrityHash: data.integrityHash,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    metadata: data.metadata,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to persist audit log for job ${job.id}: ${error.message}`);
            throw error;
        }
    }
    onCompleted(job) {
        this.logger.debug(`Audit log ${job.id} persisted successfully`);
    }
    onFailed(job, error) {
        this.logger.error(`Audit log ${job.id} FAILED after ${job.attemptsMade} attempts: ${error.message}`);
    }
};
exports.AuditLogWorker = AuditLogWorker;
__decorate([
    (0, bullmq_1.OnWorkerEvent)("completed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], AuditLogWorker.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)("failed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], AuditLogWorker.prototype, "onFailed", null);
exports.AuditLogWorker = AuditLogWorker = AuditLogWorker_1 = __decorate([
    (0, bullmq_1.Processor)("audit-events"),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditLogWorker);
//# sourceMappingURL=audit-log.worker.js.map