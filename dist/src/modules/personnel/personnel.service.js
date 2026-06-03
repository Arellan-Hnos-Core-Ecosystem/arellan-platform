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
    async findAll(requestingUserRole, role, status, limit = 20, cursor) {
        const take = limit + 1;
        const roleFilter = requestingUserRole === client_1.UserRole.OWNER
            ? []
            : [client_1.UserRole.ADMIN, client_1.UserRole.FINANCE, client_1.UserRole.MECHANIC, client_1.UserRole.TRAINEE];
        const accounts = await this.prisma.account.findMany({
            where: {
                ...(roleFilter.length > 0 ? { role: { in: roleFilter } } : {}),
                ...(role ? { role } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: "desc" },
            take,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            },
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = accounts.length > limit;
        const data = hasMore ? accounts.slice(0, limit) : accounts;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async findOne(id, requestingUserId, requestingUserRole) {
        const account = await this.prisma.account.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                mfaEnabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!account) {
            throw new common_1.NotFoundException("Personal no encontrado");
        }
        if (requestingUserRole === client_1.UserRole.MECHANIC && account.id !== requestingUserId) {
            throw new common_1.ForbiddenException("Solo puedes ver tu propia informacion");
        }
        if (requestingUserRole !== client_1.UserRole.OWNER && account.role === client_1.UserRole.OWNER) {
            throw new common_1.ForbiddenException("No tienes permisos para ver este perfil");
        }
        return account;
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