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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const { method, invoiceId, orderId, search, from, to, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (method)
            where.method = method;
        if (invoiceId)
            where.invoiceId = invoiceId;
        if (orderId)
            where.workOrderId = orderId;
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(from);
            if (to)
                where.createdAt.lte = new Date(to);
        }
        if (search) {
            where.OR = [
                { reference: { contains: search, mode: "insensitive" } },
                { notes: { contains: search, mode: "insensitive" } },
            ];
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    invoice: { select: { id: true, number: true, client: { select: { id: true, firstName: true, lastName: true } } } },
                    workOrder: { select: { id: true, number: true } },
                },
            }),
            this.prisma.payment.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async create(dto, userId) {
        if (!dto.invoiceId && !dto.workOrderId) {
            throw new common_1.BadRequestException("Debe especificar una factura o una orden de trabajo");
        }
        if (dto.method === client_1.PaymentMethod.CASH && !dto.invoiceId) {
            throw new common_1.BadRequestException("Los pagos en efectivo requieren una factura asociada");
        }
        if (dto.method === client_1.PaymentMethod.CARD && !dto.receiptUrl) {
            throw new common_1.BadRequestException("Los pagos con tarjeta requieren comprobante (receiptUrl)");
        }
        if (dto.isPersonalYape && !dto.yapeAccount) {
            throw new common_1.BadRequestException("Debe especificar la cuenta Yape (yapeAccount)");
        }
        if (dto.method === client_1.PaymentMethod.YAPE) {
            const officialSetting = await this.prisma.setting.findUnique({
                where: { key: "TALLER_YAPE_NUMBER" },
            });
            const officialYape = officialSetting?.value || null;
            if (dto.yapeAccount && officialYape && dto.yapeAccount !== officialYape) {
                this.logger.warn(`ALERTA SEGURIDAD: Pago recibido en Yape personal: ${dto.yapeAccount}. ` +
                    `Yape oficial: ${officialYape}. Orden: ${dto.workOrderId ?? "N/A"}`);
                await this.prisma.auditLog.create({
                    data: {
                        userId: userId,
                        userName: "system",
                        role: "SYSTEM",
                        action: "PAYMENT_UNAUTHORIZED_YAPE",
                        entity: "Payment",
                        entityId: null,
                        severity: "SECURITY_ALERT",
                        ipAddress: "internal",
                        metadata: {
                            yapeAccount: dto.yapeAccount,
                            officialYape,
                            workOrderId: dto.workOrderId,
                            amount: Number(dto.amount),
                            receivedBy: userId,
                        },
                    },
                });
                await this.prisma.notification.create({
                    data: {
                        userId: userId,
                        type: "SECURITY_ALERT",
                        title: "Pago en Yape no autorizado",
                        body: `Se recibió un pago de S/ ${Number(dto.amount).toFixed(2)} en Yape ${dto.yapeAccount}. ` +
                            `El Yape oficial del taller es ${officialYape}.`,
                        priority: "HIGH",
                        channel: "IN_APP",
                        data: {
                            yapeAccount: dto.yapeAccount,
                            officialYape,
                            workOrderId: dto.workOrderId,
                        },
                    },
                });
                dto.isPersonalYape = true;
            }
        }
        if (dto.invoiceId) {
            const invoice = await this.prisma.invoice.findUnique({
                where: { id: dto.invoiceId },
            });
            if (!invoice) {
                throw new common_1.NotFoundException("Factura no encontrada");
            }
        }
        if (dto.workOrderId) {
            const order = await this.prisma.workOrder.findUnique({
                where: { id: dto.workOrderId },
            });
            if (!order) {
                throw new common_1.NotFoundException("Orden de trabajo no encontrada");
            }
        }
        const payment = await this.prisma.payment.create({
            data: {
                invoiceId: dto.invoiceId,
                workOrderId: dto.workOrderId,
                method: dto.method,
                amount: dto.amount,
                reference: dto.reference,
                receivedBy: userId,
                channel: dto.channel ?? client_1.PaymentChannel.IN_PERSON,
                isPersonalYape: dto.isPersonalYape ?? false,
                yapeAccount: dto.yapeAccount,
                notes: dto.notes,
                receiptUrl: dto.receiptUrl,
                paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
            },
            include: {
                invoice: { select: { id: true, number: true } },
                workOrder: { select: { id: true, number: true } },
            },
        });
        if (dto.invoiceId) {
            await this.updateInvoicePaymentStatus(dto.invoiceId);
        }
        this.logger.log(`Pago registrado: ${payment.id}, monto: ${payment.amount}, metodo: ${payment.method}`);
        return payment;
    }
    async verify(id, verifierId) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment) {
            throw new common_1.NotFoundException("Pago no encontrado");
        }
        if (payment.verifiedBy) {
            throw new common_1.ConflictException("Este pago ya fue verificado");
        }
        const verifier = await this.prisma.account.findUnique({
            where: { id: verifierId },
        });
        if (!verifier) {
            throw new common_1.NotFoundException("Verificador no encontrado");
        }
        const updated = await this.prisma.payment.update({
            where: { id },
            data: { verifiedBy: verifierId },
        });
        this.logger.log(`Pago verificado: ${id} por ${verifierId}`);
        return updated;
    }
    async getByOrder(orderId) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            throw new common_1.NotFoundException("Orden de trabajo no encontrada");
        }
        return this.prisma.payment.findMany({
            where: { workOrderId: orderId },
            orderBy: { createdAt: "desc" },
            include: {
                invoice: { select: { id: true, number: true } },
            },
        });
    }
    async getByMethod(method, from, to) {
        return this.prisma.payment.findMany({
            where: {
                method,
                createdAt: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            orderBy: { createdAt: "desc" },
            include: {
                invoice: { select: { id: true, number: true, client: { select: { id: true, firstName: true, lastName: true } } } },
                workOrder: { select: { id: true, number: true } },
            },
        });
    }
    async getTodaySummary() {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        const payments = await this.prisma.payment.findMany({
            where: {
                createdAt: { gte: startToday, lte: endToday },
            },
            select: {
                method: true,
                amount: true,
            },
        });
        const summary = {};
        for (const p of payments) {
            if (!summary[p.method]) {
                summary[p.method] = { count: 0, total: 0 };
            }
            summary[p.method].count++;
            summary[p.method].total += Number(p.amount);
        }
        const grandTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            date: startToday.toISOString().split("T")[0],
            totalPayments: payments.length,
            grandTotal,
            byMethod: summary,
        };
    }
    async updateInvoicePaymentStatus(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true },
        });
        if (!invoice)
            return;
        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalAmount = Number(invoice.total);
        const dueAmount = totalAmount - totalPaid;
        let status = client_1.InvoiceStatus.ISSUED;
        if (totalPaid >= totalAmount) {
            status = client_1.InvoiceStatus.PAID;
        }
        else if (totalPaid > 0) {
            status = client_1.InvoiceStatus.PARTIALLY_PAID;
        }
        await this.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
                status,
                paidAmount: totalPaid,
                dueAmount: dueAmount > 0 ? dueAmount : 0,
                paidAt: status === client_1.InvoiceStatus.PAID ? new Date() : invoice.paidAt,
            },
        });
        if (invoice.workOrderId) {
            await this.prisma.workOrder.update({
                where: { id: invoice.workOrderId },
                data: { paymentStatus: status },
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map