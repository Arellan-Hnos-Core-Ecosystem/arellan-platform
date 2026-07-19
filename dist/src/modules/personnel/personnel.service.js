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
var PersonnelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonnelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let PersonnelService = PersonnelService_1 = class PersonnelService {
    prisma;
    logger = new common_1.Logger(PersonnelService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { role, status, search, page = 1 } = filters;
        const limit = filters.pageSize ?? filters.limit ?? 20;
        const skip = (page - 1) * limit;
        const take = limit;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.account.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.account.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                mfaEnabled: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!account) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const personnel = await this.prisma.personnel.findUnique({
            where: { accountId: id },
            include: {
                attendance: {
                    where: {
                        date: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            lte: new Date(),
                        },
                    },
                    orderBy: { date: "desc" },
                },
                vehicleUsages: {
                    where: { status: "PENDING_RETURN" },
                    include: { vehicle: true },
                },
                _count: { select: { vehicleUsages: true, attendance: true } },
            },
        });
        return { account, personnel };
    }
    async create(dto) {
        const existingAccount = await this.prisma.account.findUnique({
            where: { email: dto.email },
        });
        if (existingAccount) {
            throw new common_1.ConflictException("Ya existe una cuenta con ese email");
        }
        const existingDni = await this.prisma.personnel.findUnique({
            where: { dni: dto.dni },
        });
        if (existingDni) {
            throw new common_1.ConflictException("Ya existe un personal con ese DNI");
        }
        const bcrypt = await Promise.resolve().then(() => require("bcryptjs"));
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const result = await this.prisma.$transaction(async (tx) => {
            const account = await tx.account.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    name: `${dto.firstName} ${dto.lastName}`,
                    role: dto.role,
                },
            });
            const personnel = await tx.personnel.create({
                data: {
                    accountId: account.id,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    dni: dto.dni,
                    phone: dto.phone,
                    emergencyPhone: dto.emergencyPhone,
                    address: dto.address,
                    birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
                    nationality: dto.nationality ?? "PE",
                    contractType: dto.contractType ?? "FULL_TIME",
                    position: dto.position,
                    department: dto.department,
                    salary: dto.salary,
                    salaryType: dto.salaryType ?? "MONTHLY",
                    startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
                    notes: dto.notes,
                },
            });
            return { account, personnel };
        });
        this.logger.log(`Personal creado: ${result.account.email}`);
        return result;
    }
    async update(id, dto) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        if (dto.dni && dto.dni !== personnel.dni) {
            const existingDni = await this.prisma.personnel.findFirst({
                where: { dni: dto.dni, id: { not: id } },
            });
            if (existingDni) {
                throw new common_1.ConflictException("Ya existe un personal con ese DNI");
            }
        }
        const data = {};
        if (dto.firstName !== undefined)
            data.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            data.lastName = dto.lastName;
        if (dto.dni !== undefined)
            data.dni = dto.dni;
        if (dto.phone !== undefined)
            data.phone = dto.phone;
        if (dto.emergencyPhone !== undefined)
            data.emergencyPhone = dto.emergencyPhone;
        if (dto.address !== undefined)
            data.address = dto.address;
        if (dto.birthDate !== undefined)
            data.birthDate = new Date(dto.birthDate);
        if (dto.nationality !== undefined)
            data.nationality = dto.nationality;
        if (dto.contractType !== undefined)
            data.contractType = dto.contractType;
        if (dto.position !== undefined)
            data.position = dto.position;
        if (dto.department !== undefined)
            data.department = dto.department;
        if (dto.salary !== undefined)
            data.salary = dto.salary;
        if (dto.salaryType !== undefined)
            data.salaryType = dto.salaryType;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        const updated = await this.prisma.personnel.update({
            where: { id },
            data,
            include: { account: { select: { id: true, email: true, name: true, role: true, status: true } } },
        });
        if (dto.firstName || dto.lastName) {
            await this.prisma.account.update({
                where: { id: personnel.accountId },
                data: { name: `${updated.firstName} ${updated.lastName}` },
            });
        }
        this.logger.log(`Personal actualizado: ${updated.id}`);
        return updated;
    }
    async softDelete(id) {
        const personnel = await this.prisma.personnel.findUnique({ where: { id } });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        await this.prisma.$transaction([
            this.prisma.personnel.update({
                where: { id },
                data: { deletedAt: new Date() },
            }),
            this.prisma.account.update({
                where: { id: personnel.accountId },
                data: { status: client_1.AccountStatus.TERMINATED, deletedAt: new Date() },
            }),
        ]);
        this.logger.log(`Personal eliminado (soft): ${personnel.id}`);
        return { message: "Personal marcado como eliminado" };
    }
    async getAttendance(personnelId, month, year) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const now = new Date();
        const targetYear = year ?? now.getFullYear();
        const targetMonth = month ?? now.getMonth() + 1;
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        const records = await this.prisma.attendance.findMany({
            where: {
                personnelId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: "desc" },
        });
        const counts = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            HALF_DAY: 0,
            PERMISSION: 0,
            VACATION: 0,
            SICK_LEAVE: 0,
            HOLIDAY: 0,
        };
        for (const r of records) {
            counts[r.type]++;
        }
        return { records, counts, month: targetMonth, year: targetYear };
    }
    async checkIn(personnelId) {
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
                throw new common_1.ConflictException("Ya registraste tu entrada hoy");
            }
            const updated = await this.prisma.attendance.update({
                where: { id: existing.id },
                data: { checkIn: new Date() },
            });
            this.logger.log(`Check-in actualizado: ${personnelId}`);
            return updated;
        }
        const isLate = new Date().getHours() >= 9;
        const record = await this.prisma.attendance.create({
            data: {
                personnelId,
                date: today,
                checkIn: new Date(),
                type: isLate ? "LATE" : "PRESENT",
            },
        });
        this.logger.log(`Check-in creado: ${personnelId}`);
        return record;
    }
    async checkOut(personnelId) {
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
            throw new common_1.NotFoundException("No hay registro de entrada para hoy. Debes hacer check-in primero.");
        }
        if (!record.checkIn) {
            throw new common_1.BadRequestException("No tienes hora de entrada registrada.");
        }
        if (record.checkOut) {
            throw new common_1.ConflictException("Ya registraste tu salida hoy");
        }
        const updated = await this.prisma.attendance.update({
            where: { id: record.id },
            data: { checkOut: new Date() },
        });
        this.logger.log(`Check-out registrado: ${personnelId}`);
        return updated;
    }
    async getTodayAttendance() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const records = await this.prisma.attendance.findMany({
            where: { date: today },
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
            orderBy: { checkIn: "asc" },
        });
        const present = records.filter((r) => r.checkIn).length;
        const absent = records.filter((r) => !r.checkIn && r.type === "ABSENT").length;
        const late = records.filter((r) => r.type === "LATE").length;
        return { records, summary: { present, absent, late, total: records.length } };
    }
    async authorizeVehicleUsage(dto, requestingUserId, requestingUserRole) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: dto.personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehiculo no encontrado");
        }
        if (![client_1.UserRole.OWNER, client_1.UserRole.ADMIN].includes(requestingUserRole)) {
            throw new common_1.ForbiddenException("Solo OWNER o ADMIN pueden autorizar uso de vehiculos");
        }
        const usage = await this.prisma.vehicleUsage.create({
            data: {
                vehicleId: dto.vehicleId,
                personnelId: dto.personnelId,
                authorizedBy: requestingUserId,
                purpose: dto.purpose,
                destination: dto.destination,
                odometerOut: dto.odometerOut,
                checkoutAt: new Date(),
                expectedReturn: dto.expectedReturn ? new Date(dto.expectedReturn) : new Date(Date.now() + 24 * 60 * 60 * 1000),
                notes: dto.notes,
            },
            include: {
                vehicle: true,
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        this.logger.log(`Uso de vehiculo autorizado: ${vehicle.plate} -> ${personnel.firstName} ${personnel.lastName}`);
        return usage;
    }
    async getActiveVehicleUsages() {
        return this.prisma.vehicleUsage.findMany({
            where: { status: "PENDING_RETURN" },
            include: {
                vehicle: true,
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { checkoutAt: "desc" },
        });
    }
    async returnVehicle(usageId, odometerIn) {
        const usage = await this.prisma.vehicleUsage.findUnique({
            where: { id: usageId },
        });
        if (!usage) {
            throw new common_1.NotFoundException("Registro de uso de vehiculo no encontrado");
        }
        if (usage.status !== "PENDING_RETURN") {
            throw new common_1.ConflictException("Este vehiculo ya fue devuelto");
        }
        const now = new Date();
        let status = "RETURNED_ON_TIME";
        if (now > usage.expectedReturn) {
            status = "RETURNED_LATE";
        }
        const updated = await this.prisma.vehicleUsage.update({
            where: { id: usageId },
            data: {
                odometerIn,
                returnAt: now,
                status: status,
            },
        });
        this.logger.log(`Vehiculo devuelto: ${usageId}, odometro entrada: ${odometerIn}`);
        return updated;
    }
    async getPerformanceReport(personnelId) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        const account = await this.prisma.account.findUnique({
            where: { id: personnel.accountId },
        });
        if (!account) {
            throw new common_1.NotFoundException("Cuenta no encontrada");
        }
        const completedOrders = await this.prisma.workOrder.count({
            where: {
                mechanicId: account.id,
                status: { in: ["DELIVERED", "READY"] },
            },
        });
        const orders = await this.prisma.workOrder.findMany({
            where: {
                mechanicId: account.id,
                status: { in: ["DELIVERED", "READY"] },
                completedAt: { not: null },
            },
            select: {
                id: true,
                number: true,
                completedAt: true,
                startedAt: true,
                parts: { include: { item: true } },
            },
            orderBy: { completedAt: "desc" },
        });
        let totalMinutes = 0;
        let ordersWithTime = 0;
        const partsUsedMap = new Map();
        for (const order of orders) {
            for (const part of order.parts) {
                const key = part.itemId;
                if (!partsUsedMap.has(key)) {
                    partsUsedMap.set(key, { name: part.item?.name ?? key, count: 0 });
                }
                partsUsedMap.get(key).count += part.quantity;
            }
            if (order.startedAt && order.completedAt) {
                const diff = order.completedAt.getTime() - order.startedAt.getTime();
                totalMinutes += diff / (1000 * 60);
                ordersWithTime++;
            }
        }
        const partsUsed = Array.from(partsUsedMap.values()).sort((a, b) => b.count - a.count);
        const averageTimeMinutes = ordersWithTime > 0 ? Math.round(totalMinutes / ordersWithTime) : 0;
        return {
            personnelId,
            name: `${personnel.firstName} ${personnel.lastName}`,
            completedOrders,
            averageTimeMinutes,
            partsUsed,
        };
    }
    async updateRole(id, role, performedBy) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        if (account.role === client_1.UserRole.OWNER) {
            throw new common_1.ForbiddenException("No se puede cambiar el rol de un OWNER");
        }
        if (role === client_1.UserRole.OWNER) {
            throw new common_1.ForbiddenException("No se puede asignar rol OWNER");
        }
        const updated = await this.prisma.account.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, name: true, role: true, status: true },
        });
        this.logger.log(`Rol de ${updated.email} cambiado de ${account.role} a ${role} por ${performedBy}`);
        return updated;
    }
    async updateStatus(id, status) {
        const account = await this.prisma.account.findUnique({ where: { id } });
        if (!account) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        if (account.role === client_1.UserRole.OWNER) {
            throw new common_1.ForbiddenException("No se puede cambiar el estado de un OWNER");
        }
        const updated = await this.prisma.account.update({
            where: { id },
            data: { status },
            select: { id: true, email: true, name: true, role: true, status: true },
        });
        this.logger.log(`Estado de ${updated.email} cambiado a ${status}`);
        return updated;
    }
    async checkInByUser(userId, notes) {
        const personnel = await this.prisma.personnel.findUnique({ where: { accountId: userId } });
        if (!personnel)
            throw new common_1.NotFoundException("Personal no encontrado para este usuario");
        return this.checkIn(personnel.id);
    }
    async checkOutByUser(userId, notes) {
        const personnel = await this.prisma.personnel.findUnique({ where: { accountId: userId } });
        if (!personnel)
            throw new common_1.NotFoundException("Personal no encontrado para este usuario");
        return this.checkOut(personnel.id);
    }
    async getOverdueVehicleUsages() {
        return this.prisma.vehicleUsage.findMany({
            where: {
                status: "PENDING_RETURN",
                expectedReturn: { lt: new Date() },
            },
            include: {
                vehicle: true,
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { expectedReturn: "asc" },
        });
    }
    async getAllSecurityList(requestingUserRole) {
        const roleFilter = requestingUserRole === client_1.UserRole.OWNER
            ? Object.values(client_1.UserRole)
            : [client_1.UserRole.ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE];
        return this.prisma.account.findMany({
            where: { role: { in: roleFilter }, status: client_1.AccountStatus.ACTIVE },
            orderBy: { name: "asc" },
            select: { id: true, name: true, role: true },
        });
    }
};
exports.PersonnelService = PersonnelService;
exports.PersonnelService = PersonnelService = PersonnelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PersonnelService);
//# sourceMappingURL=personnel.service.js.map