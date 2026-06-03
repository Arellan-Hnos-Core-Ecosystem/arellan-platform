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
var VehiclesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let VehiclesService = VehiclesService_1 = class VehiclesService {
    prisma;
    logger = new common_1.Logger(VehiclesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, limit = 20, cursor) {
        const take = limit + 1;
        const where = search
            ? {
                OR: [
                    { plate: { contains: search, mode: "insensitive" } },
                    { brand: { contains: search, mode: "insensitive" } },
                ],
            }
            : {};
        const vehicles = await this.prisma.vehicle.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take,
            include: { client: { select: { id: true, firstName: true, lastName: true } } },
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = vehicles.length > limit;
        const data = hasMore ? vehicles.slice(0, limit) : vehicles;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async findByPlate(plate) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { plate: { equals: plate, mode: "insensitive" } },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehiculo no encontrado");
        }
        return vehicle;
    }
    async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                client: true,
                workOrders: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true,
                        number: true,
                        status: true,
                        description: true,
                        totalCost: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehiculo no encontrado");
        }
        return vehicle;
    }
    async create(dto) {
        const existing = await this.prisma.vehicle.findFirst({
            where: { plate: { equals: dto.plate, mode: "insensitive" } },
        });
        if (existing) {
            throw new common_1.ConflictException("Ya existe un vehiculo con esa placa");
        }
        const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
        if (!client) {
            throw new common_1.NotFoundException("Cliente no encontrado");
        }
        const vehicle = await this.prisma.vehicle.create({
            data: dto,
            include: { client: { select: { id: true, firstName: true, lastName: true } } },
        });
        this.logger.log(`Vehiculo creado: ${vehicle.plate} (${vehicle.id})`);
        return vehicle;
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.plate) {
            const existing = await this.prisma.vehicle.findFirst({
                where: { plate: { equals: dto.plate, mode: "insensitive" }, id: { not: id } },
            });
            if (existing) {
                throw new common_1.ConflictException("Ya existe otro vehiculo con esa placa");
            }
        }
        if (dto.clientId) {
            const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
            if (!client) {
                throw new common_1.NotFoundException("Cliente no encontrado");
            }
        }
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: dto,
            include: { client: { select: { id: true, firstName: true, lastName: true } } },
        });
        this.logger.log(`Vehiculo actualizado: ${vehicle.plate} (${vehicle.id})`);
        return vehicle;
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = VehiclesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map