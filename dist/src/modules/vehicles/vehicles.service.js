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
const redis_service_1 = require("../../common/redis/redis.service");
const VEHICLE_CACHE_PREFIX = "vehicles";
const VEHICLE_CACHE_TTL_SHORT = 60;
const VEHICLE_CACHE_TTL_LONG = 300;
let VehiclesService = VehiclesService_1 = class VehiclesService {
    prisma;
    redis;
    logger = new common_1.Logger(VehiclesService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(search, limit = 20, cursor) {
        const take = limit + 1;
        const cacheKey = `${VEHICLE_CACHE_PREFIX}:list:${search ?? "all"}:${limit}:${cursor ?? "start"}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
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
        const result = { data, nextCursor, hasMore };
        await this.redis.set(cacheKey, JSON.stringify(result), VEHICLE_CACHE_TTL_SHORT);
        return result;
    }
    async findByPlate(plate) {
        const cacheKey = `${VEHICLE_CACHE_PREFIX}:plate:${plate.toUpperCase()}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { plate: { equals: plate, mode: "insensitive" } },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehiculo no encontrado");
        }
        await this.redis.set(cacheKey, JSON.stringify(vehicle), VEHICLE_CACHE_TTL_LONG);
        return vehicle;
    }
    async findOne(id) {
        const cacheKey = `${VEHICLE_CACHE_PREFIX}:id:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                client: true,
                workOrders: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                    select: {
                        id: true, number: true, status: true,
                        description: true, totalCost: true, createdAt: true,
                    },
                },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException("Vehiculo no encontrado");
        }
        await this.redis.set(cacheKey, JSON.stringify(vehicle), VEHICLE_CACHE_TTL_LONG);
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
        await this.invalidateVehicleCache();
        this.logger.log(`Vehiculo creado: ${vehicle.plate} (${vehicle.id})`);
        return vehicle;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        if (dto.plate) {
            const dup = await this.prisma.vehicle.findFirst({
                where: { plate: { equals: dto.plate, mode: "insensitive" }, id: { not: id } },
            });
            if (dup)
                throw new common_1.ConflictException("Ya existe otro vehiculo con esa placa");
        }
        if (dto.clientId) {
            const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
            if (!client)
                throw new common_1.NotFoundException("Cliente no encontrado");
        }
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: dto,
            include: { client: { select: { id: true, firstName: true, lastName: true } } },
        });
        await this.invalidateVehicleCache();
        await this.redis.del(`${VEHICLE_CACHE_PREFIX}:id:${id}`);
        if (existing.plate)
            await this.redis.del(`${VEHICLE_CACHE_PREFIX}:plate:${existing.plate.toUpperCase()}`);
        if (dto.plate)
            await this.redis.del(`${VEHICLE_CACHE_PREFIX}:plate:${dto.plate.toUpperCase()}`);
        this.logger.log(`Vehiculo actualizado: ${vehicle.plate} (${vehicle.id})`);
        return vehicle;
    }
    async invalidateVehicleCache() {
        try {
            const client = this.redis.client;
            let cursor = "0";
            do {
                const [nextCursor, keys] = await client.scan(cursor, "MATCH", `${VEHICLE_CACHE_PREFIX}:list:*`, "COUNT", 100);
                cursor = nextCursor;
                if (keys.length > 0)
                    await client.del(...keys);
            } while (cursor !== "0");
        }
        catch (err) {
            this.logger.warn(`Cache invalidation warning: ${err.message}`);
        }
    }
    async getWorkshopFleet() {
        return this.prisma.vehicle.findMany({
            where: { plate: { startsWith: "TAL-" } },
            include: {
                usageLogs: {
                    where: { status: "PENDING_RETURN" },
                    take: 1,
                    include: { personnel: { select: { firstName: true, lastName: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = VehiclesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map