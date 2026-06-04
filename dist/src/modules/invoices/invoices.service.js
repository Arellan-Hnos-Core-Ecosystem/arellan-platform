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
var InvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let InvoicesService = InvoicesService_1 = class InvoicesService {
    prisma;
    logger = new common_1.Logger(InvoicesService_1.name);
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
            this.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
                    workOrder: { select: { id: true, number: true } },
                    _count: { select: { payments: true } },
                },
            }),
            this.prisma.invoice.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                workOrder: {
                    include: {
                        vehicle: true,
                        items: { include: { item: { select: { id: true, sku: true, name: true } } } },
                    },
                },
                payments: {
                    orderBy: { paidAt: "desc" },
                },
            },
        });
        if (!invoice) {
            throw new common_1.NotFoundException("Factura no encontrada");
        }
        return invoice;
    }
    async createFromOrder(orderId, userId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            include: { items: true, client: true },
        });
        if (!workOrder) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { workOrderId: orderId },
        });
        if (existingInvoice) {
            throw new common_1.ConflictException(`Ya existe una factura (${existingInvoice.number}) para esta orden`);
        }
        const year = new Date().getFullYear();
        const count = await this.prisma.invoice.count({
            where: { number: { startsWith: `INV-${year}-` } },
        });
        const number = `INV-${year}-${String(count + 1).padStart(4, "0")}`;
        const subtotal = Number(workOrder.totalCost ?? 0);
        const discount = Number(workOrder.discount ?? 0);
        const tax = (subtotal - discount) * 0.18;
        const total = subtotal - discount + tax;
        const invoice = await this.prisma.invoice.create({
            data: {
                number,
                workOrderId: orderId,
                clientId: workOrder.clientId,
                type: client_1.InvoiceType.BOLETA,
                status: client_1.InvoiceStatus.DRAFT,
                subtotal,
                tax,
                discount,
                total,
                dueAmount: total,
                createdBy: userId,
            },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, companyName: true } },
                workOrder: { select: { id: true, number: true } },
            },
        });
        await this.prisma.workOrder.update({
            where: { id: orderId },
            data: { paymentStatus: client_1.InvoiceStatus.DRAFT },
        });
        this.logger.log(`Factura creada: ${number} desde OT ${workOrder.number}`);
        return invoice;
    }
    async issue(id, userId) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) {
            throw new common_1.NotFoundException("Factura no encontrada");
        }
        if (invoice.status !== client_1.InvoiceStatus.DRAFT) {
            throw new common_1.ConflictException("Solo se pueden emitir facturas en estado DRAFT");
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const inv = await tx.invoice.update({
                where: { id },
                data: {
                    status: client_1.InvoiceStatus.ISSUED,
                    issuedAt: new Date(),
                    dueDate: invoice.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            });
            if (invoice.workOrderId) {
                await tx.workOrder.update({
                    where: { id: invoice.workOrderId },
                    data: { paymentStatus: client_1.InvoiceStatus.ISSUED },
                });
            }
            return inv;
        });
        this.logger.log(`Factura emitida: ${updated.number}`);
        return updated;
    }
    async cancel(id, reason) {
        const invoice = await this.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) {
            throw new common_1.NotFoundException("Factura no encontrada");
        }
        if (invoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new common_1.ConflictException("La factura ya esta cancelada");
        }
        if (invoice.status === client_1.InvoiceStatus.PAID) {
            throw new common_1.ConflictException("No se puede cancelar una factura ya pagada");
        }
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                status: client_1.InvoiceStatus.CANCELLED,
                cancelledAt: new Date(),
                cancelReason: reason,
            },
        });
        this.logger.log(`Factura cancelada: ${updated.number}`);
        return updated;
    }
    async getByClient(clientId) {
        const client = await this.prisma.client.findUnique({
            where: { id: clientId },
        });
        if (!client) {
            throw new common_1.NotFoundException("Cliente no encontrado");
        }
        return this.prisma.invoice.findMany({
            where: { clientId },
            orderBy: { createdAt: "desc" },
            include: {
                workOrder: { select: { id: true, number: true } },
                _count: { select: { payments: true } },
            },
        });
    }
    async getOverdue() {
        const now = new Date();
        return this.prisma.invoice.findMany({
            where: {
                status: client_1.InvoiceStatus.OVERDUE,
                dueDate: { lt: now },
                dueAmount: { gt: 0 },
            },
            orderBy: { dueDate: "asc" },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } },
                workOrder: { select: { id: true, number: true } },
            },
        });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = InvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map