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
var PurchasesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const client_1 = require("@prisma/client");
const inventory_1 = require("../../domain/inventory");
const VALID_TRANSITIONS = {
    DRAFT: [client_1.PurchaseStatus.SENT, client_1.PurchaseStatus.CANCELLED],
    SENT: [client_1.PurchaseStatus.CONFIRMED, client_1.PurchaseStatus.CANCELLED],
    CONFIRMED: [client_1.PurchaseStatus.PARTIALLY_RECEIVED, client_1.PurchaseStatus.RECEIVED, client_1.PurchaseStatus.CANCELLED],
    PARTIALLY_RECEIVED: [client_1.PurchaseStatus.RECEIVED, client_1.PurchaseStatus.CANCELLED],
    RECEIVED: [],
    CANCELLED: [],
};
let PurchasesService = PurchasesService_1 = class PurchasesService {
    prisma;
    redis;
    logger = new common_1.Logger(PurchasesService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(filters) {
        const { status, supplierId, search, from, to, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (supplierId)
            where.supplierId = supplierId;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        if (search) {
            where.OR = [
                { number: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.purchase.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    supplier: { select: { id: true, name: true, contactName: true, phone: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.purchase.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        item: {
                            select: { id: true, sku: true, name: true, stock: true },
                        },
                    },
                },
                commissions: {
                    include: {
                        personnel: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });
        if (!purchase) {
            throw new common_1.NotFoundException("Compra no encontrada");
        }
        return purchase;
    }
    async create(dto, userId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: dto.supplierId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException("Proveedor no encontrado");
        }
        const year = new Date().getFullYear();
        const count = await this.prisma.purchase.count({
            where: { number: { startsWith: `OC-${year}-` } },
        });
        const number = `OC-${year}-${String(count + 1).padStart(4, "0")}`;
        let subtotal = 0;
        for (const item of dto.items) {
            const inventoryItem = await this.prisma.inventoryItem.findUnique({
                where: { id: item.itemId },
            });
            if (!inventoryItem) {
                throw new common_1.NotFoundException(`Item de inventario no encontrado: ${item.itemId}`);
            }
            subtotal += item.quantity * item.unitCost;
        }
        const tax = dto.tax ?? 0;
        const shipping = dto.shipping ?? 0;
        const customs = dto.customs ?? 0;
        const total = subtotal + tax + shipping + customs;
        const isImported = dto.isImported ?? supplier.isImporter;
        inventory_1.LandedCost.assertImportDeclaration(isImported, customs);
        inventory_1.LandedCost.assertCommissionRecipient(dto.commissionAmount, dto.commissionTo);
        const purchase = await this.prisma.purchase.create({
            data: {
                number,
                supplierId: dto.supplierId,
                status: client_1.PurchaseStatus.DRAFT,
                subtotal,
                tax,
                shipping,
                customs,
                total,
                currency: dto.currency ?? "PEN",
                isImported,
                notes: dto.notes,
                expectedAt: dto.expectedAt ? new Date(dto.expectedAt) : null,
                commissionAmount: dto.commissionAmount,
                commissionTo: dto.commissionTo,
                createdBy: userId,
                items: {
                    create: dto.items.map((i) => ({
                        itemId: i.itemId,
                        quantity: i.quantity,
                        unitCost: i.unitCost,
                        totalCost: i.quantity * i.unitCost,
                        notes: i.notes,
                    })),
                },
            },
            include: {
                supplier: { select: { id: true, name: true } },
                items: { include: { item: { select: { id: true, sku: true, name: true } } } },
            },
        });
        this.logger.log(`Compra creada: ${number} - ${supplier.name}`);
        return purchase;
    }
    async updateStatus(id, status, _userId) {
        const purchase = await this.prisma.purchase.findUnique({ where: { id } });
        if (!purchase) {
            throw new common_1.NotFoundException("Compra no encontrada");
        }
        const allowed = VALID_TRANSITIONS[purchase.status];
        if (!allowed.includes(status)) {
            throw new common_1.ConflictException(`No se puede cambiar de ${purchase.status} a ${status}. ` +
                `Transiciones permitidas: ${allowed.length ? allowed.join(", ") : "ninguna"}`);
        }
        const updateData = { status };
        if (status === client_1.PurchaseStatus.SENT) {
            updateData.orderedAt = new Date();
        }
        else if (status === client_1.PurchaseStatus.RECEIVED) {
            updateData.receivedAt = new Date();
        }
        const updated = await this.prisma.purchase.update({
            where: { id },
            data: updateData,
            include: {
                supplier: { select: { id: true, name: true } },
                items: true,
            },
        });
        this.logger.log(`Compra ${updated.number}: ${purchase.status} -> ${status}`);
        return updated;
    }
    async receiveItems(id, dto, userId) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: { items: { include: { item: true } } },
        });
        if (!purchase) {
            throw new common_1.NotFoundException("Compra no encontrada");
        }
        if (purchase.status === client_1.PurchaseStatus.CANCELLED) {
            throw new common_1.ConflictException("No se pueden recibir items de una compra cancelada");
        }
        if (![client_1.PurchaseStatus.CONFIRMED, client_1.PurchaseStatus.SENT, client_1.PurchaseStatus.PARTIALLY_RECEIVED].includes(purchase.status)) {
            throw new common_1.ConflictException("La compra debe estar en estado CONFIRMED, SENT o PARTIALLY_RECEIVED");
        }
        const allocations = inventory_1.LandedCost.allocate({
            lines: purchase.items.map((pi) => ({
                itemId: pi.itemId,
                quantity: pi.quantity,
                unitCost: Number(pi.unitCost),
            })),
            customs: Number(purchase.customs),
            commissionAmount: Number(purchase.commissionAmount ?? 0),
        });
        const touchedItemIds = new Set();
        await this.prisma.$transaction(async (tx) => {
            for (const { itemId, qty } of dto.items) {
                const purchaseItem = purchase.items.find((pi) => pi.id === itemId);
                if (!purchaseItem) {
                    throw new common_1.NotFoundException(`Item de compra no encontrado: ${itemId}`);
                }
                if (purchaseItem.receivedQty + qty > purchaseItem.quantity) {
                    throw new common_1.ConflictException(`Cantidad recibida excede la ordenada para ${purchaseItem.item?.name ?? itemId}. ` +
                        `Recibido: ${purchaseItem.receivedQty}, ordenado: ${purchaseItem.quantity}, intentando recibir: ${qty}`);
                }
                await tx.purchaseItem.update({
                    where: { id: itemId },
                    data: { receivedQty: purchaseItem.receivedQty + qty },
                });
                const allocation = allocations.find((a) => a.itemId === purchaseItem.itemId);
                const blended = inventory_1.LandedCost.blendAverageCost(purchaseItem.item.stock, Number(purchaseItem.item.costPrice), Number(purchaseItem.item.customsCost ?? 0), qty, allocation.landedUnitCost, allocation.customsPerUnit);
                await tx.inventoryItem.update({
                    where: { id: purchaseItem.itemId },
                    data: {
                        stock: { increment: qty },
                        costPrice: blended.costPrice,
                        customsCost: blended.customsCost,
                        isImported: purchase.isImported || purchaseItem.item.isImported,
                    },
                });
                await tx.inventoryMovement.create({
                    data: {
                        itemId: purchaseItem.itemId,
                        type: client_1.MovementType.IN,
                        quantity: qty,
                        authorizedBy: userId,
                        unitCost: allocation.landedUnitCost,
                        justification: `Recepcion de compra ${purchase.number}`,
                    },
                });
                touchedItemIds.add(purchaseItem.itemId);
            }
        });
        for (const itemId of touchedItemIds) {
            await this.redis.del(`inventory:item:${itemId}`);
        }
        await this.redis.del("inventory:valuation");
        const updated = await this.prisma.purchase.findUnique({
            where: { id },
            include: { items: { include: { item: { select: { id: true, sku: true, name: true, stock: true } } } } },
        });
        const allReceived = updated.items.every((i) => i.receivedQty >= i.quantity);
        const someReceived = updated.items.some((i) => i.receivedQty > 0);
        if (allReceived) {
            await this.prisma.purchase.update({
                where: { id },
                data: { status: client_1.PurchaseStatus.RECEIVED, receivedAt: new Date() },
            });
        }
        else if (someReceived) {
            await this.prisma.purchase.update({
                where: { id },
                data: { status: client_1.PurchaseStatus.PARTIALLY_RECEIVED },
            });
        }
        this.logger.log(`Items recibidos para compra ${purchase.number}`);
        return updated;
    }
    async getBySupplier(supplierId) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: supplierId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException("Proveedor no encontrado");
        }
        return this.prisma.purchase.findMany({
            where: { supplierId },
            orderBy: { createdAt: "desc" },
            include: {
                _count: { select: { items: true } },
            },
        });
    }
    async getImports() {
        return this.prisma.purchase.findMany({
            where: { isImported: true },
            orderBy: { createdAt: "desc" },
            include: {
                supplier: { select: { id: true, name: true } },
                _count: { select: { items: true } },
            },
        });
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = PurchasesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map