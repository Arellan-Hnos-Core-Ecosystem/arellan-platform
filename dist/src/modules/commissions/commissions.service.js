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
var CommissionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let CommissionsService = CommissionsService_1 = class CommissionsService {
    prisma;
    logger = new common_1.Logger(CommissionsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { status, personnelId, supplierId, from, to, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (personnelId)
            where.personnelId = personnelId;
        if (supplierId)
            where.supplierId = supplierId;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.commission.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    personnel: { select: { id: true, firstName: true, lastName: true, position: true } },
                    supplier: { select: { id: true, name: true } },
                    purchase: { select: { id: true, number: true } },
                },
            }),
            this.prisma.commission.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async create(dto, requestingUserRole, requestingUserId) {
        if (requestingUserRole !== "OWNER") {
            throw new common_1.ForbiddenException("Solo el OWNER puede crear comisiones");
        }
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: dto.personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        if (dto.purchaseId) {
            const purchase = await this.prisma.purchase.findUnique({
                where: { id: dto.purchaseId },
            });
            if (!purchase) {
                throw new common_1.NotFoundException("Compra no encontrada");
            }
        }
        if (dto.supplierId) {
            const supplier = await this.prisma.supplier.findUnique({
                where: { id: dto.supplierId },
            });
            if (!supplier) {
                throw new common_1.NotFoundException("Proveedor no encontrado");
            }
        }
        const commission = await this.prisma.commission.create({
            data: {
                personnelId: dto.personnelId,
                supplierId: dto.supplierId,
                purchaseId: dto.purchaseId,
                type: dto.type,
                amount: dto.amount,
                percentage: dto.percentage,
                status: client_1.ApprovalStatus.PENDING,
                notes: dto.notes,
            },
            include: {
                personnel: { select: { id: true, firstName: true, lastName: true } },
                supplier: { select: { id: true, name: true } },
            },
        });
        this.logger.log(`Comision creada: ${commission.id} para ${personnel.firstName} ${personnel.lastName}`);
        return commission;
    }
    async approve(id, approverId) {
        const commission = await this.prisma.commission.findUnique({ where: { id } });
        if (!commission) {
            throw new common_1.NotFoundException("Comision no encontrada");
        }
        if (commission.status !== client_1.ApprovalStatus.PENDING) {
            throw new common_1.ConflictException(`La comision ya fue ${commission.status}`);
        }
        const approver = await this.prisma.account.findUnique({
            where: { id: approverId },
        });
        if (!approver) {
            throw new common_1.NotFoundException("Aprobador no encontrado");
        }
        if (![client_1.UserRole.OWNER, client_1.UserRole.ADMIN].includes(approver.role)) {
            throw new common_1.ForbiddenException("Solo OWNER o ADMIN pueden aprobar comisiones");
        }
        const updated = await this.prisma.commission.update({
            where: { id },
            data: {
                status: client_1.ApprovalStatus.APPROVED,
            },
            include: {
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        this.logger.log(`Comision aprobada: ${id} por ${approverId}`);
        return updated;
    }
    async pay(id) {
        const commission = await this.prisma.commission.findUnique({ where: { id } });
        if (!commission) {
            throw new common_1.NotFoundException("Comision no encontrada");
        }
        if (commission.status !== client_1.ApprovalStatus.APPROVED) {
            throw new common_1.ConflictException("Solo se pueden pagar comisiones aprobadas");
        }
        if (commission.paidAt) {
            throw new common_1.ConflictException("Esta comision ya fue pagada");
        }
        const updated = await this.prisma.commission.update({
            where: { id },
            data: { paidAt: new Date() },
            include: {
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        this.logger.log(`Comision pagada: ${id}`);
        return updated;
    }
    async getByPersonnel(personnelId) {
        const personnel = await this.prisma.personnel.findUnique({
            where: { id: personnelId },
        });
        if (!personnel) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        return this.prisma.commission.findMany({
            where: { personnelId },
            orderBy: { createdAt: "desc" },
            include: {
                supplier: { select: { id: true, name: true } },
                purchase: { select: { id: true, number: true } },
            },
        });
    }
    async getBySupplier(supplierId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException("Proveedor no encontrado");
        }
        return this.prisma.commission.findMany({
            where: { supplierId },
            orderBy: { createdAt: "desc" },
            include: {
                personnel: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = CommissionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map