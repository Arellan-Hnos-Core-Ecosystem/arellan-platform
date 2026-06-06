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
var BackupWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
let BackupWorker = BackupWorker_1 = class BackupWorker {
    prisma;
    logger = new common_1.Logger(BackupWorker_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dailyBackup() {
        this.logger.log("Daily backup job triggered");
        await this.prisma.auditLog.create({
            data: {
                userId: "system",
                userName: "BackupWorker",
                role: "OWNER",
                action: "BACKUP_TRIGGERED",
                entity: "System",
                severity: "INFO",
                ipAddress: "system",
                metadata: { timestamp: new Date().toISOString(), type: "DAILY_AUTOMATIC" },
            },
        });
        this.logger.log("Backup log registered. Cloud provider handles actual backup.");
    }
};
exports.BackupWorker = BackupWorker;
__decorate([
    (0, schedule_1.Cron)("0 2 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupWorker.prototype, "dailyBackup", null);
exports.BackupWorker = BackupWorker = BackupWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BackupWorker);
//# sourceMappingURL=backup.worker.js.map