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
var ProcessBiometricAttendanceUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessBiometricAttendanceUseCase = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const personnel_1 = require("../../../domain/personnel");
const VERIFY_METHOD_LABELS = {
    1: "huella",
    4: "PIN",
    15: "facial",
};
let ProcessBiometricAttendanceUseCase = ProcessBiometricAttendanceUseCase_1 = class ProcessBiometricAttendanceUseCase {
    prisma;
    logger = new common_1.Logger(ProcessBiometricAttendanceUseCase_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(dto) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { dni: dto.dni },
        });
        if (!personnel) {
            throw new common_1.NotFoundException(`No existe personal con DNI ${dto.dni}`);
        }
        const checkInAt = new Date(dto.timestamp);
        const date = new Date(checkInAt);
        date.setHours(0, 0, 0, 0);
        const scheduleSetting = await this.prisma.setting.findUnique({
            where: { key: "attendance_schedule" },
        });
        const schedule = personnel_1.WorkSchedule.parse(scheduleSetting?.value ?? null);
        const evaluation = personnel_1.WorkSchedule.evaluate(checkInAt, schedule);
        const verifyMethodLabel = VERIFY_METHOD_LABELS[dto.verifyMethod] ?? `metodo ${dto.verifyMethod}`;
        const notes = `Marcado biometrico ZKTeco (dispositivo ${dto.deviceSN}, ${verifyMethodLabel})`;
        const type = evaluation.isLate ? client_1.AttendanceType.LATE : client_1.AttendanceType.PRESENT;
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.attendance.findUnique({
                where: { personnelId_date: { personnelId: personnel.id, date } },
            });
            const attendance = existing
                ? await tx.attendance.update({
                    where: { id: existing.id },
                    data: existing.checkIn ? {} : { checkIn: checkInAt, type, notes },
                })
                : await tx.attendance.create({
                    data: { personnelId: personnel.id, date, checkIn: checkInAt, type, notes },
                });
            let penaltyAmount = 0;
            if (evaluation.isLate) {
                penaltyAmount = personnel_1.WorkSchedule.calculatePenalty(Number(personnel.salary), personnel.salaryType, evaluation.lateMinutes);
                await tx.auditLog.create({
                    data: {
                        userId: "system",
                        userName: "ZKTeco-Bridge",
                        role: "SYSTEM",
                        action: "ATTENDANCE_LATE_PENALTY",
                        entity: "Personnel",
                        entityId: personnel.id,
                        severity: "WARNING",
                        ipAddress: "iot-bridge",
                        metadata: {
                            attendanceId: attendance.id,
                            dni: dto.dni,
                            deviceSN: dto.deviceSN,
                            checkIn: checkInAt.toISOString(),
                            scheduledStart: evaluation.scheduledStart.toISOString(),
                            lateMinutes: evaluation.lateMinutes,
                            penaltyAmount,
                            salaryType: personnel.salaryType,
                        },
                    },
                });
            }
            return { attendance, penaltyAmount };
        });
        this.logger.log(`Asistencia biometrica: personal=${personnel.id} dni=${dto.dni} estado=${type} tarde=${evaluation.lateMinutes}min`);
        return {
            attendanceId: result.attendance.id,
            personnelId: personnel.id,
            date: result.attendance.date,
            status: type,
            isLate: evaluation.isLate,
            lateMinutes: evaluation.lateMinutes,
            penaltyAmount: result.penaltyAmount,
        };
    }
};
exports.ProcessBiometricAttendanceUseCase = ProcessBiometricAttendanceUseCase;
exports.ProcessBiometricAttendanceUseCase = ProcessBiometricAttendanceUseCase = ProcessBiometricAttendanceUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessBiometricAttendanceUseCase);
//# sourceMappingURL=process-biometric-attendance.use-case.js.map