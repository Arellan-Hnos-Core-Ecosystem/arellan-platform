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
var CashboxReportWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashboxReportWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const realtime_gateway_1 = require("../common/gateway/realtime.gateway");
let CashboxReportWorker = CashboxReportWorker_1 = class CashboxReportWorker {
    prisma;
    realtimeGateway;
    logger = new common_1.Logger(CashboxReportWorker_1.name);
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async sendDailyCashboxReport() {
        this.logger.log("Generating daily cashbox report...");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [payments, expenses, session, orders] = await Promise.all([
            this.prisma.payment.aggregate({
                where: { paidAt: { gte: today } },
                _sum: { amount: true },
                _count: true,
            }),
            this.prisma.expenseAuthorization.aggregate({
                where: { createdAt: { gte: today }, status: "DISBURSED" },
                _sum: { amount: true },
            }),
            this.prisma.cashboxSession.findFirst({
                where: { openedAt: { gte: today } },
                orderBy: { openedAt: "desc" },
            }),
            this.prisma.workOrder.count({
                where: { status: { in: ["IN_DIAGNOSIS", "IN_PROGRESS", "IN_REVIEW", "BUDGETED"] } },
            }),
        ]);
        const report = {
            date: today.toISOString().split("T")[0],
            ingresos: Number(payments._sum.amount ?? 0),
            egresos: Number(expenses._sum.amount ?? 0),
            saldoNeto: Number(payments._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0),
            transacciones: payments._count,
            otsActivas: orders,
            discrepancia: session?.discrepancy ?? 0,
            estadoCaja: session?.status ?? "NO_SESSION",
        };
        this.realtimeGateway.emitSecurityAlert({
            type: "CASHBOX_DAILY_REPORT",
            description: `Reporte de caja: Ingresos S/.${report.ingresos.toFixed(2)} | Neto S/.${report.saldoNeto.toFixed(2)}`,
            severity: "INFO",
        });
        await this.prisma.auditLog.create({
            data: {
                userId: "system",
                userName: "CashboxReportWorker",
                role: "OWNER",
                action: "CASHBOX_DAILY_REPORT_SENT",
                entity: "CashboxSession",
                severity: "INFO",
                ipAddress: "system",
                metadata: report,
            },
        });
        this.logger.log(`Daily cashbox report sent. Ingresos: S/.${report.ingresos}`);
    }
};
exports.CashboxReportWorker = CashboxReportWorker;
__decorate([
    (0, schedule_1.Cron)("0 20 * * 1-6"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CashboxReportWorker.prototype, "sendDailyCashboxReport", null);
exports.CashboxReportWorker = CashboxReportWorker = CashboxReportWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], CashboxReportWorker);
//# sourceMappingURL=cashbox-report.worker.js.map