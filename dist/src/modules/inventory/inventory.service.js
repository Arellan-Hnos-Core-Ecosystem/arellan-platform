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
var InventoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const CACHE_PREFIX = "inventory";
const CATALOG_CACHE_TTL = 120;
const ITEM_CACHE_TTL = 300;
let InventoryService = InventoryService_1 = class InventoryService {
    prisma;
    redis;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(category, lowStock, limit = 20, cursor, search, page, pageSize) {
        if (lowStock) {
            return this.findAllLowStock(category, limit, cursor);
        }
        const where = {
            ...(category ? { categoryId: category } : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { sku: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        };
        if (page !== undefined || pageSize !== undefined) {
            const size = Math.min(pageSize ?? 10, 100);
            const currentPage = page ?? 1;
            const offsetKey = `${CACHE_PREFIX}:catalog:offset:${category ?? "all"}:${search ?? "none"}:${currentPage}:${size}`;
            const cachedOffset = await this.redis.get(offsetKey);
            if (cachedOffset)
                return JSON.parse(cachedOffset);
            const [pagedItems, total] = await Promise.all([
                this.prisma.inventoryItem.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    take: size,
                    skip: (currentPage - 1) * size,
                    include: { category: { select: { name: true } } },
                }),
                this.prisma.inventoryItem.count({ where }),
            ]);
            const offsetResult = {
                data: pagedItems.map((i) => this.flattenItem(i)),
                total,
                page: currentPage,
                pageSize: size,
                totalPages: Math.ceil(total / size),
            };
            await this.redis.set(offsetKey, JSON.stringify(offsetResult), CATALOG_CACHE_TTL);
            return offsetResult;
        }
        const cacheKey = `${CACHE_PREFIX}:catalog:${category ?? "all"}:${search ?? "none"}:${limit}:${cursor ?? "start"}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const take = limit + 1;
        const items = await this.prisma.inventoryItem.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: { category: { select: { name: true } } },
        });
        const hasMore = items.length > limit;
        const sliced = hasMore ? items.slice(0, limit) : items;
        const data = sliced.map((i) => this.flattenItem(i));
        const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;
        const result = { data, nextCursor, hasMore };
        await this.redis.set(cacheKey, JSON.stringify(result), CATALOG_CACHE_TTL);
        return result;
    }
    flattenItem(i) {
        return {
            ...i,
            code: i.sku,
            currentStock: i.stock,
            costPrice: Number(i.costPrice ?? 0),
            salePrice: Number(i.unitPrice ?? 0),
            category: i.category?.name ?? null,
            categoryName: i.category?.name ?? "Sin categoría",
        };
    }
    async findAllLowStock(category, limit = 20, cursor) {
        const cacheKey = `${CACHE_PREFIX}:lowstock:${category ?? "all"}:${limit}:${cursor ?? "start"}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const take = limit + 1;
        const items = await this.prisma.inventoryItem.findMany({
            where: {
                stock: { lte: this.prisma.inventoryItem.fields.minStock },
                ...(category ? { categoryId: category } : {}),
            },
            orderBy: { stock: "asc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            include: { category: { select: { name: true } } },
        });
        const hasMore = items.length > limit;
        const sliced = hasMore ? items.slice(0, limit) : items;
        const data = sliced.map((i) => this.flattenItem(i));
        const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;
        const result = { data, nextCursor, hasMore };
        await this.redis.set(cacheKey, JSON.stringify(result), CATALOG_CACHE_TTL);
        return result;
    }
    async findOne(id) {
        const cacheKey = `${CACHE_PREFIX}:item:${id}`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException("Item de inventario no encontrado");
        }
        await this.redis.set(cacheKey, JSON.stringify(item), ITEM_CACHE_TTL);
        return item;
    }
    async create(dto) {
        const existing = await this.prisma.inventoryItem.findUnique({
            where: { sku: dto.sku },
        });
        if (existing) {
            throw new common_1.ConflictException("Ya existe un item con ese SKU");
        }
        let categoryId = null;
        if (dto.category) {
            const byId = await this.prisma.category.findUnique({ where: { id: dto.category } });
            if (byId) {
                categoryId = byId.id;
            }
            else {
                const byName = await this.prisma.category.upsert({
                    where: { name: dto.category },
                    update: {},
                    create: { name: dto.category },
                });
                categoryId = byName.id;
            }
        }
        try {
            const item = await this.prisma.inventoryItem.create({
                data: {
                    sku: dto.sku,
                    name: dto.name,
                    categoryId,
                    costPrice: 0,
                    stock: dto.stock,
                    minStock: dto.minStock,
                    unitPrice: dto.unitPrice,
                },
            });
            await this.invalidateCatalogCache();
            this.logger.log(`Item creado: ${item.sku} (${item.id})`);
            return item;
        }
        catch (err) {
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (err.code === "P2002") {
                    throw new common_1.ConflictException("El SKU ya se encuentra registrado");
                }
                if (err.code === "P2003") {
                    throw new common_1.BadRequestException("La categoría indicada no existe");
                }
            }
            throw err;
        }
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.sku) {
            const existing = await this.prisma.inventoryItem.findFirst({
                where: { sku: dto.sku, id: { not: id } },
            });
            if (existing) {
                throw new common_1.ConflictException("Ya existe otro item con ese SKU");
            }
        }
        const { category, ...rest } = dto;
        const updateData = {
            ...rest,
            ...(category !== undefined ? { categoryId: category } : {}),
        };
        const item = await this.prisma.inventoryItem.update({
            where: { id },
            data: updateData,
        });
        await this.redis.del(`${CACHE_PREFIX}:item:${id}`);
        await this.invalidateCatalogCache();
        this.logger.log(`Item actualizado: ${item.sku} (${item.id})`);
        return item;
    }
    async addMovement(authorizedBy, itemId, dto) {
        if (dto.type === client_1.MovementType.OUT && !dto.orderId) {
            throw new common_1.ConflictException("El ID de la orden de trabajo es requerido para movimientos de salida");
        }
        if (dto.type === client_1.MovementType.ADJUSTMENT && !dto.justification) {
            throw new common_1.ConflictException("La justificacion es requerida para ajustes de inventario");
        }
        const item = await this.findOne(itemId);
        if (dto.type === client_1.MovementType.OUT && item.stock < dto.quantity) {
            throw new common_1.ConflictException(`Stock insuficiente. Disponible: ${item.stock}, solicitado: ${dto.quantity}`);
        }
        let newStock;
        switch (dto.type) {
            case client_1.MovementType.IN:
                newStock = item.stock + dto.quantity;
                break;
            case client_1.MovementType.OUT:
                newStock = item.stock - dto.quantity;
                break;
            case client_1.MovementType.ADJUSTMENT:
                newStock = dto.quantity;
                break;
        }
        const [movement] = await this.prisma.$transaction([
            this.prisma.inventoryMovement.create({
                data: {
                    itemId,
                    type: dto.type,
                    quantity: dto.quantity,
                    orderId: dto.orderId ?? null,
                    authorizedBy,
                    justification: dto.justification ?? null,
                    unitCost: item.unitPrice,
                },
            }),
            this.prisma.inventoryItem.update({
                where: { id: itemId },
                data: { stock: newStock },
            }),
        ]);
        await this.redis.del(`${CACHE_PREFIX}:item:${itemId}`);
        await this.invalidateCatalogCache();
        await this.invalidateByPattern(`${CACHE_PREFIX}:lowstock:*`);
        await this.redis.del(`${CACHE_PREFIX}:valuation`);
        this.logger.log(`Movimiento ${dto.type} x${dto.quantity} en item ${item.sku}, stock: ${item.stock} -> ${newStock}`);
        return movement;
    }
    async getMovements(itemId, limit = 20, cursor) {
        await this.findOne(itemId);
        const take = limit + 1;
        const movements = await this.prisma.inventoryMovement.findMany({
            where: { itemId },
            orderBy: { createdAt: "desc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = movements.length > limit;
        const data = hasMore ? movements.slice(0, limit) : movements;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async getAllMovements(itemId, type, limit = 20, cursor) {
        const take = limit + 1;
        const where = {};
        if (itemId)
            where.itemId = itemId;
        if (type)
            where.type = type;
        const movements = await this.prisma.inventoryMovement.findMany({
            where,
            include: { item: { select: { name: true, sku: true, unit: true } } },
            orderBy: { createdAt: "desc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = movements.length > limit;
        const data = hasMore ? movements.slice(0, limit) : movements;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async getCriticalStock() {
        const cacheKey = `${CACHE_PREFIX}:critical`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const items = await this.prisma.inventoryItem.findMany({
            where: { stock: { lte: this.prisma.inventoryItem.fields.minStock } },
            orderBy: { stock: "asc" },
            include: { category: { select: { name: true } } },
        });
        const flattened = items.map((i) => this.flattenItem(i));
        await this.redis.set(cacheKey, JSON.stringify(flattened), 60);
        return flattened;
    }
    async getValuation() {
        const cacheKey = `${CACHE_PREFIX}:valuation`;
        const cached = await this.redis.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const items = await this.prisma.inventoryItem.findMany({
            where: { isActive: true },
            select: { stock: true, costPrice: true, unitPrice: true, minStock: true },
        });
        const totalItems = items.length;
        const totalCostValue = items.reduce((sum, i) => sum + Number(i.costPrice) * i.stock, 0);
        const totalSaleValue = items.reduce((sum, i) => sum + Number(i.unitPrice) * i.stock, 0);
        const lowStockCount = items.filter((i) => i.stock <= i.minStock).length;
        const result = { totalItems, totalCostValue, totalSaleValue, lowStockCount };
        await this.redis.set(cacheKey, JSON.stringify(result), 120);
        return result;
    }
    async reserveForOrder(itemId, quantity, workOrderId, userId) {
        if (!workOrderId) {
            throw new common_1.HttpException({
                statusCode: 422,
                error: "INVENTORY_NO_ACTIVE_ORDER",
                message: "No se puede retirar inventario sin una Orden de Trabajo activa vinculada.",
            }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const order = await this.prisma.workOrder.findUnique({
            where: { id: workOrderId },
            select: { id: true, status: true, number: true },
        });
        if (!order)
            throw new common_1.NotFoundException(`OT ${workOrderId} no encontrada`);
        if (order.status !== "IN_PROGRESS") {
            throw new common_1.HttpException({
                statusCode: 422,
                error: "INVENTORY_NO_ACTIVE_ORDER",
                message: `Solo se puede retirar inventario de OT en estado IN_PROGRESS. OT ${order.number} está en estado ${order.status}.`,
            }, common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
            if (!item)
                throw new common_1.NotFoundException(`Item ${itemId} no encontrado`);
            if (item.stock < quantity) {
                throw new common_1.BadRequestException(`Stock insuficiente. Disponible: ${item.stock}, solicitado: ${quantity}`);
            }
            await tx.inventoryItem.update({
                where: { id: itemId },
                data: { stock: { decrement: quantity } },
            });
            await tx.inventoryMovement.create({
                data: {
                    itemId,
                    type: client_1.MovementType.OUT,
                    quantity,
                    orderId: workOrderId,
                    authorizedBy: userId,
                    justification: `Reservado para orden ${workOrderId}`,
                },
            });
            const updated = await tx.inventoryItem.findUnique({ where: { id: itemId } });
            this.logger.log(`Reserva: ${item.sku} x${quantity} para OT ${workOrderId}. Stock: ${item.stock} -> ${updated?.stock}`);
            return { success: true, remainingStock: updated?.stock ?? 0 };
        });
        await this.redis.del(`${CACHE_PREFIX}:item:${itemId}`);
        await this.invalidateCatalogCache();
        await this.invalidateByPattern(`${CACHE_PREFIX}:lowstock:*`);
        await this.redis.del(`${CACHE_PREFIX}:critical`);
        await this.redis.del(`${CACHE_PREFIX}:valuation`);
        return result;
    }
    async invalidateCatalogCache() {
        await this.invalidateByPattern(`${CACHE_PREFIX}:catalog:*`);
    }
    async invalidateByPattern(pattern) {
        try {
            const client = this.redis.client;
            let cursor = "0";
            do {
                const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100);
                cursor = nextCursor;
                if (keys.length > 0)
                    await client.del(...keys);
            } while (cursor !== "0");
        }
        catch (err) {
            this.logger.warn(`Cache invalidation warning (${pattern}): ${err.message}`);
        }
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map