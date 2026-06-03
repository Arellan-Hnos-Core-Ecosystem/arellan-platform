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
var ClientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ClientsService = ClientsService_1 = class ClientsService {
    prisma;
    logger = new common_1.Logger(ClientsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, limit = 20, cursor) {
        const take = limit + 1;
        const where = search
            ? {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { dni: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};
        const clients = await this.prisma.client.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = clients.length > limit;
        const data = hasMore ? clients.slice(0, limit) : clients;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async findOne(id) {
        const client = await this.prisma.client.findUnique({
            where: { id },
            include: { vehicles: true },
        });
        if (!client) {
            throw new common_1.NotFoundException("Cliente no encontrado");
        }
        return client;
    }
    async create(dto) {
        if (dto.dni) {
            const existing = await this.prisma.client.findUnique({ where: { dni: dto.dni } });
            if (existing) {
                throw new common_1.ConflictException("Ya existe un cliente con ese DNI");
            }
        }
        const client = await this.prisma.client.create({ data: dto });
        this.logger.log(`Cliente creado: ${client.firstName} ${client.lastName} (${client.id})`);
        return client;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.dni) {
            const existing = await this.prisma.client.findFirst({
                where: { dni: dto.dni, id: { not: id } },
            });
            if (existing) {
                throw new common_1.ConflictException("Ya existe otro cliente con ese DNI");
            }
        }
        const client = await this.prisma.client.update({
            where: { id },
            data: dto,
        });
        this.logger.log(`Cliente actualizado: ${client.firstName} ${client.lastName} (${client.id})`);
        return client;
    }
    async getHistory(id) {
        await this.findOne(id);
        const workOrders = await this.prisma.workOrder.findMany({
            where: { clientId: id },
            orderBy: { createdAt: "desc" },
            include: {
                vehicle: { select: { plate: true, brand: true, model: true } },
                mechanic: { select: { name: true } },
            },
        });
        return workOrders;
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map