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
var QuotesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let QuotesService = QuotesService_1 = class QuotesService {
    prisma;
    logger = new common_1.Logger(QuotesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { status, clientId, search, from, to, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (clientId)
            where.clientId = clientId;
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
            this.prisma.quote.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
                    workOrder: { select: { id: true, number: true, status: true } },
                },
            }),
            this.prisma.quote.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: {
                client: true,
                workOrder: {
                    include: {
                        vehicle: true,
                        items: {
                            include: { item: { select: { id: true, sku: true, name: true } } },
                        },
                    },
                },
            },
        });
        if (!quote) {
            throw new common_1.NotFoundException("Cotizacion no encontrada");
        }
        return quote;
    }
    async create(dto, userId) {
        const client = await this.prisma.client.findUnique({
            where: { id: dto.clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException("Cliente no encontrado");
        }
        if (!dto.workOrderId) {
            throw new common_1.BadRequestException("Se requiere una orden de trabajo para crear una cotizacion");
        }
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { id: dto.workOrderId },
            include: { items: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        const year = new Date().getFullYear();
        const count = await this.prisma.quote.count({
            where: { number: { startsWith: `COT-${year}-` } },
        });
        const number = `COT-${year}-${String(count + 1).padStart(4, "0")}`;
        const itemsTotal = workOrder.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
        const subtotal = itemsTotal;
        const tax = subtotal * 0.18;
        const total = subtotal + tax;
        const quote = await this.prisma.quote.create({
            data: {
                number,
                clientId: dto.clientId,
                workOrderId: dto.workOrderId,
                status: client_1.QuoteStatus.DRAFT,
                validUntil: new Date(dto.validUntil),
                subtotal,
                tax,
                total,
                notes: dto.notes,
                createdBy: userId,
            },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
                workOrder: { select: { id: true, number: true } },
            },
        });
        this.logger.log(`Cotizacion creada: ${number}`);
        return quote;
    }
    async approve(id) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
        });
        if (!quote) {
            throw new common_1.NotFoundException("Cotizacion no encontrada");
        }
        if (quote.status !== client_1.QuoteStatus.DRAFT && quote.status !== client_1.QuoteStatus.SENT) {
            throw new common_1.ConflictException("Solo se pueden aprobar cotizaciones en estado DRAFT o SENT");
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const q = await tx.quote.update({
                where: { id },
                data: {
                    status: client_1.QuoteStatus.APPROVED,
                    approvedAt: new Date(),
                },
            });
            if (quote.workOrderId) {
                await tx.workOrder.update({
                    where: { id: quote.workOrderId },
                    data: { status: client_1.OrderStatus.BUDGETED },
                });
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: quote.workOrderId,
                        status: client_1.OrderStatus.BUDGETED,
                        changedBy: quote.createdBy,
                    },
                });
            }
            return q;
        });
        this.logger.log(`Cotizacion aprobada: ${updated.number}`);
        return updated;
    }
    async reject(id, reason) {
        const quote = await this.prisma.quote.findUnique({ where: { id } });
        if (!quote) {
            throw new common_1.NotFoundException("Cotizacion no encontrada");
        }
        if (quote.status === client_1.QuoteStatus.APPROVED || quote.status === client_1.QuoteStatus.CONVERTED) {
            throw new common_1.ConflictException("No se puede rechazar una cotizacion aprobada o convertida");
        }
        const updated = await this.prisma.quote.update({
            where: { id },
            data: {
                status: client_1.QuoteStatus.REJECTED,
                rejectedAt: new Date(),
                rejectionReason: reason,
            },
        });
        this.logger.log(`Cotizacion rechazada: ${updated.number}`);
        return updated;
    }
    async convertToOrder(id, userId) {
        const quote = await this.prisma.quote.findUnique({
            where: { id },
            include: { workOrder: { include: { items: true } } },
        });
        if (!quote) {
            throw new common_1.NotFoundException("Cotizacion no encontrada");
        }
        if (quote.status !== client_1.QuoteStatus.APPROVED) {
            throw new common_1.ConflictException("Solo se pueden convertir cotizaciones aprobadas");
        }
        if (!quote.workOrderId || !quote.workOrder) {
            throw new common_1.BadRequestException("La cotizacion no tiene una orden de trabajo asociada");
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const q = await tx.quote.update({
                where: { id },
                data: { status: client_1.QuoteStatus.CONVERTED },
            });
            await tx.workOrder.update({
                where: { id: quote.workOrderId },
                data: {
                    status: client_1.OrderStatus.IN_PROGRESS,
                    startedAt: new Date(),
                    totalCost: quote.total,
                    finalAmount: quote.total,
                },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: quote.workOrderId,
                    status: client_1.OrderStatus.IN_PROGRESS,
                    changedBy: userId,
                },
            });
            return q;
        });
        this.logger.log(`Cotizacion convertida a orden: ${updated.number}`);
        return updated;
    }
};
exports.QuotesService = QuotesService;
exports.QuotesService = QuotesService = QuotesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuotesService);
//# sourceMappingURL=quotes.service.js.map