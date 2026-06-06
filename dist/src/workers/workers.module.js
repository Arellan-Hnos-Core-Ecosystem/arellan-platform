"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkersModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const audit_log_worker_1 = require("./audit-log.worker");
const inventory_alert_worker_1 = require("./inventory-alert.worker");
const cashbox_report_worker_1 = require("./cashbox-report.worker");
const audit_anomaly_worker_1 = require("./audit-anomaly.worker");
const backup_worker_1 = require("./backup.worker");
const monthly_discrepancy_worker_1 = require("./monthly-discrepancy.worker");
const prisma_module_1 = require("../common/prisma/prisma.module");
let WorkersModule = class WorkersModule {
};
exports.WorkersModule = WorkersModule;
exports.WorkersModule = WorkersModule = __decorate([
    (0, common_1.Module)({
        imports: [schedule_1.ScheduleModule.forRoot(), prisma_module_1.PrismaModule],
        providers: [
            audit_log_worker_1.AuditLogWorker,
            inventory_alert_worker_1.InventoryAlertWorker,
            cashbox_report_worker_1.CashboxReportWorker,
            audit_anomaly_worker_1.AuditAnomalyWorker,
            backup_worker_1.BackupWorker,
            monthly_discrepancy_worker_1.MonthlyDiscrepancyWorker,
        ],
        exports: [schedule_1.ScheduleModule],
    })
], WorkersModule);
//# sourceMappingURL=workers.module.js.map