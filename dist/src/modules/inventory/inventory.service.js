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
const client_1 = require("@prisma/client");
let InventoryService = InventoryService_1 = class InventoryService {
    prisma;
    logger = new common_1.Logger(InventoryService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(category, lowStock, limit = 20, cursor) {
        if (lowStock) {
            return this.findAllLowStock(category, limit, cursor);
        }
        const take = limit + 1;
        const items = await this.prisma.inventoryItem.findMany({
            where: category ? { category } : {},
            orderBy: { createdAt: "desc" },
            take,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        });
        const hasMore = items.length > limit;
        const data = hasMore ? items.slice(0, limit) : items;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async findAllLowStock(category, limit = 20, cursor) {
        const conditions = [`stock <= "minStock"`];
        if (category) {
            conditions.push(`category = '${category.replace(/'/g, "''")}'`);
        }
        if (cursor) {
            conditions.push(`id < '${cursor.replace(/'/g, "''")}'`);
        }
        const whereClause = conditions.join(" AND ");
        const take = limit + 1;
        const items = await this.prisma.$queryRawUnsafe(`SELECT * FROM inventory_items WHERE ${whereClause} ORDER BY id DESC LIMIT ${take}`);
        const inventoryItems = items.map((i) => ({
            ...i,
            unitPrice: i.unitPrice,
        }));
        const hasMore = inventoryItems.length > limit;
        const data = hasMore ? inventoryItems.slice(0, limit) : inventoryItems;
        const nextCursor = hasMore ? data[data.length - 1].id : null;
        return { data, nextCursor, hasMore };
    }
    async findOne(id) {
        const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
        if (!item) {
            throw new common_1.NotFoundException("Item de inventario no encontrado");
        }
        return item;
    }
    async create(dto) {
        const existing = await this.prisma.inventoryItem.findUnique({
            where: { sku: dto.sku },
        });
        if (existing) {
            throw new common_1.ConflictException("Ya existe un item con ese SKU");
        }
        const item = await this.prisma.inventoryItem.create({
            data: {
                sku: dto.sku,
                name: dto.name,
                category: dto.category,
                stock: dto.stock,
                minStock: dto.minStock,
                unitPrice: dto.unitPrice,
            },
        });
        this.logger.log(`Item creado: ${item.sku} (${item.id})`);
        return item;
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
        const item = await this.prisma.inventoryItem.update({
            where: { id },
            data: dto,
        });
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
    async getCriticalStock() {
        const items = await this.prisma.$queryRawUnsafe(`SELECT * FROM inventory_items WHERE stock <= "minStock" ORDER BY stock ASC`);
        return items;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = InventoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map