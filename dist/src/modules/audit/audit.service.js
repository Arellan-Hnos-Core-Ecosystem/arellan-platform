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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let AuditService = AuditService_1 = class AuditService {
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { userId, action, entity, entityId, from, to, limit = 50, cursor, page, pageSize } = filters;
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (entity)
            where.entity = entity;
        if (entityId)
            where.entityId = entityId;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        if (page !== undefined || pageSize !== undefined) {
            const size = Math.min(pageSize ?? 20, 100);
            const currentPage = page ?? 1;
            const [pagedLogs, pagedTotal] = await Promise.all([
                this.prisma.auditLog.findMany({
                    where,
                    take: size,
                    skip: (currentPage - 1) * size,
                    orderBy: { createdAt: "desc" },
                }),
                this.prisma.auditLog.count({ where }),
            ]);
            return {
                data: pagedLogs,
                pagination: {
                    total: pagedTotal,
                    limit: size,
                    cursor: null,
                    hasNextPage: currentPage * size < pagedTotal,
                },
            };
        }
        const take = Math.min(limit, 100) + 1;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                take,
                orderBy: { createdAt: "desc" },
                ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        const hasMore = logs.length > Math.min(limit, 100);
        const data = hasMore ? logs.slice(0, -1) : logs;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return {
            data,
            pagination: { total, limit: Math.min(limit, 100), cursor: nextCursor, hasNextPage: hasMore },
        };
    }
    async findOne(id) {
        const log = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!log) {
            throw new common_1.NotFoundException("Registro de auditoria no encontrado");
        }
        return log;
    }
    async getByUser(userId, limit = 50, cursor) {
        return this.findAll({ userId, limit, cursor });
    }
    async getByEntity(entity, entityId, limit = 50, cursor) {
        return this.findAll({ entity, entityId, limit, cursor });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map