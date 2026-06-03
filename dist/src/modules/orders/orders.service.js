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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
const VALID_TRANSITIONS = {
    RECEIVED: [client_1.OrderStatus.IN_DIAGNOSIS, client_1.OrderStatus.CANCELLED],
    IN_DIAGNOSIS: [client_1.OrderStatus.BUDGETED, client_1.OrderStatus.CANCELLED],
    BUDGETED: [client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.CANCELLED],
    IN_PROGRESS: [client_1.OrderStatus.IN_REVIEW, client_1.OrderStatus.CANCELLED],
    IN_REVIEW: [client_1.OrderStatus.READY, client_1.OrderStatus.IN_PROGRESS, client_1.OrderStatus.CANCELLED],
    READY: [client_1.OrderStatus.DELIVERED, client_1.OrderStatus.CANCELLED],
    DELIVERED: [],
    CANCELLED: [],
};
const ORDER_INCLUDE = {
    vehicle: true,
    client: true,
    mechanic: {
        select: { id: true, name: true, email: true, role: true },
    },
};
let OrdersService = OrdersService_1 = class OrdersService {
    prisma;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const year = new Date().getFullYear();
        const count = await this.prisma.workOrder.count({
            where: { number: { startsWith: `OT-${year}-` } },
        });
        const number = `OT-${year}-${String(count + 1).padStart(4, "0")}`;
        const order = await this.prisma.workOrder.create({
            data: {
                number,
                vehicleId: dto.vehicleId,
                clientId: dto.clientId,
                mechanicId: dto.mechanicId,
                description: dto.description,
            },
            include: ORDER_INCLUDE,
        });
        this.logger.log(`OT ${number} creada`);
        return order;
    }
    async findAll(filters) {
        const { status, mechanicId, from, to, limit = 20, cursor } = filters;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (mechanicId) {
            where.mechanicId = mechanicId;
        }
        if (from || to) {
            where.receivedAt = {};
            if (from)
                where.receivedAt.gte = new Date(from);
            if (to)
                where.receivedAt.lte = new Date(to);
        }
        const take = limit + 1;
        const orders = await this.prisma.workOrder.findMany({
            where,
            take,
            orderBy: { id: "asc" },
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            include: ORDER_INCLUDE,
        });
        const hasMore = orders.length > limit;
        const data = hasMore ? orders.slice(0, limit) : orders;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor };
    }
    async findOne(id) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id },
            include: {
                ...ORDER_INCLUDE,
                photos: true,
                parts: { include: { item: true } },
                statusHistory: { orderBy: { timestamp: "desc" } },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        return order;
    }
    async update(id, dto) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        if (dto.status && order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.ConflictException("No se puede modificar una orden cancelada");
        }
        const data = {};
        if (dto.status !== undefined) {
            data.status = dto.status;
        }
        if (dto.diagnosis !== undefined) {
            data.diagnosis = dto.diagnosis;
        }
        if (dto.laborCost !== undefined) {
            data.laborCost = new client_1.Prisma.Decimal(dto.laborCost);
        }
        if (dto.partsCost !== undefined) {
            data.partsCost = new client_1.Prisma.Decimal(dto.partsCost);
        }
        if (dto.estimatedDelivery !== undefined) {
            data.estimatedDelivery = new Date(dto.estimatedDelivery);
        }
        if (dto.laborCost !== undefined || dto.partsCost !== undefined) {
            const currentLabor = dto.laborCost !== undefined ? new client_1.Prisma.Decimal(dto.laborCost) : order.laborCost ?? new client_1.Prisma.Decimal(0);
            const currentParts = dto.partsCost !== undefined ? new client_1.Prisma.Decimal(dto.partsCost) : order.partsCost ?? new client_1.Prisma.Decimal(0);
            data.totalCost = currentLabor.plus(currentParts);
        }
        const updated = await this.prisma.workOrder.update({
            where: { id },
            data,
            include: ORDER_INCLUDE,
        });
        this.logger.log(`OT ${updated.number} actualizada`);
        return updated;
    }
    async updateStatus(id, dto, userId) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        const allowed = VALID_TRANSITIONS[order.status];
        if (!allowed.includes(dto.status)) {
            throw new common_1.ConflictException(`No se puede cambiar de ${order.status} a ${dto.status}. ` +
                `Transiciones permitidas: ${allowed.length ? allowed.join(", ") : "ninguna"}`);
        }
        const updateData = { status: dto.status };
        if (dto.status === client_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        const [updated] = await this.prisma.$transaction([
            this.prisma.workOrder.update({
                where: { id },
                data: updateData,
                include: ORDER_INCLUDE,
            }),
            this.prisma.orderStatusHistory.create({
                data: {
                    orderId: id,
                    status: dto.status,
                    changedBy: userId,
                },
            }),
        ]);
        this.logger.log(`OT ${updated.number}: ${order.status} → ${dto.status}`);
        return updated;
    }
    async softDelete(id) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.ConflictException("La orden ya esta cancelada");
        }
        const updated = await this.prisma.workOrder.update({
            where: { id },
            data: { status: client_1.OrderStatus.CANCELLED },
            include: ORDER_INCLUDE,
        });
        this.logger.log(`OT ${updated.number} cancelada (soft delete)`);
        return updated;
    }
    async assignMechanic(id, mechanicId) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        if (order.status === client_1.OrderStatus.CANCELLED || order.status === client_1.OrderStatus.DELIVERED) {
            throw new common_1.ConflictException("No se puede reasignar una orden finalizada o cancelada");
        }
        const updated = await this.prisma.workOrder.update({
            where: { id },
            data: { mechanicId },
            include: ORDER_INCLUDE,
        });
        this.logger.log(`OT ${updated.number} reasignada al mecanico ${mechanicId}`);
        return updated;
    }
    async findByMechanic(mechanicId, filters) {
        return this.findAll({ ...filters, mechanicId });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map