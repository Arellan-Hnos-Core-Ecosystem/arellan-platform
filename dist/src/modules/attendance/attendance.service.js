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
var AttendanceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const personnel_1 = require("../../domain/personnel");
let AttendanceService = AttendanceService_1 = class AttendanceService {
    prisma;
    logger = new common_1.Logger(AttendanceService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { search, type, from, to, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (type) {
            where.type = type;
        }
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = new Date(from);
            if (to)
                where.date.lte = new Date(to);
        }
        if (search) {
            where.personnel = {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                ],
            };
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.attendance.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: "desc" },
                include: {
                    personnel: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            position: true,
                            account: { select: { id: true, email: true, role: true } },
                        },
                    },
                },
            }),
            this.prisma.attendance.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getByPersonnel(personnelId, from, to) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const where = { personnelId };
        if (from || to) {
            where.date = {};
            if (from)
                where.date.gte = new Date(from);
            if (to)
                where.date.lte = new Date(to);
        }
        const records = await this.prisma.attendance.findMany({
            where,
            orderBy: { date: "desc" },
            include: {
                personnel: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        return records;
    }
    async getTodayStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const records = await this.prisma.attendance.findMany({
            where: { date: today },
            select: { type: true, checkIn: true, checkOut: true },
        });
        const present = records.filter((r) => r.checkIn && !r.checkOut).length;
        const absent = records.filter((r) => !r.checkIn).length;
        const late = records.filter((r) => r.type === "LATE").length;
        const completed = records.filter((r) => r.checkOut).length;
        return {
            today: today.toISOString().split("T")[0],
            present,
            absent,
            late,
            completed,
            total: records.length,
        };
    }
    async checkIn(personnelId, notes) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.attendance.findUnique({
            where: { personnelId_date: { personnelId, date: today } },
        });
        if (existing) {
            if (existing.checkIn) {
                throw new common_1.ConflictException("Ya se registro la entrada hoy");
            }
            const updated = await this.prisma.attendance.update({
                where: { id: existing.id },
                data: { checkIn: new Date(), notes: notes ?? existing.notes },
            });
            this.logger.log(`Check-in actualizado: personal=${personnelId}`);
            return updated;
        }
        const scheduleSetting = await this.prisma.setting.findUnique({
            where: { key: "attendance_schedule" },
        });
        const schedule = personnel_1.WorkSchedule.parse(scheduleSetting?.value ?? null);
        const isLate = personnel_1.WorkSchedule.evaluate(new Date(), schedule).isLate;
        const record = await this.prisma.attendance.create({
            data: {
                personnelId,
                date: today,
                checkIn: new Date(),
                type: isLate ? "LATE" : "PRESENT",
                notes,
            },
            include: {
                personnel: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        this.logger.log(`Check-in creado: personal=${personnelId}`);
        return record;
    }
    async checkOut(personnelId, notes) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const record = await this.prisma.attendance.findUnique({
            where: { personnelId_date: { personnelId, date: today } },
        });
        if (!record) {
            throw new common_1.NotFoundException("No hay check-in registrado para hoy");
        }
        if (!record.checkIn) {
            throw new common_1.BadRequestException("No tienes hora de entrada registrada");
        }
        if (record.checkOut) {
            throw new common_1.ConflictException("Ya se registro la salida hoy");
        }
        const updated = await this.prisma.attendance.update({
            where: { id: record.id },
            data: { checkOut: new Date(), notes: notes ?? record.notes },
            include: {
                personnel: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        this.logger.log(`Check-out registrado: personal=${personnelId}`);
        return updated;
    }
    async verify(personnelId, date, verifiedBy) {
        const parsedDate = new Date(date);
        parsedDate.setHours(0, 0, 0, 0);
        const record = await this.prisma.attendance.findUnique({
            where: {
                personnelId_date: { personnelId, date: parsedDate },
            },
        });
        if (!record) {
            throw new common_1.NotFoundException("No se encontro registro de asistencia para esa fecha");
        }
        const updated = await this.prisma.attendance.update({
            where: { id: record.id },
            data: { verifiedBy },
            include: {
                personnel: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
        this.logger.log(`Asistencia verificada: personal=${personnelId}, fecha=${date}, por=${verifiedBy}`);
        return updated;
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = AttendanceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map