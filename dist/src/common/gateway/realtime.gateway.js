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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    jwtService;
    prisma;
    server;
    logger = new common_1.Logger("RealtimeGateway");
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    afterInit() {
        this.logger.log("Realtime WebSocket Gateway initialized");
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.replace("Bearer ", "");
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub || payload.id;
            const role = payload.role;
            client.data = { userId, role, email: payload.email };
            client.join(`role:${role}`);
            client.join(`user:${userId}`);
            if (role === "MECHANIC" || role === "TRAINEE") {
                client.join(`mechanic:${userId}`);
            }
            if (role === "CLIENT") {
                client.join(`client:${userId}`);
            }
            if (role === "OWNER" || role === "ADMIN" || role === "FINANCE") {
                client.join("dashboard");
            }
            if (role === "OWNER" || role === "ADMIN") {
                client.join("room:management");
            }
            this.logger.log(`WS client connected: ${payload.email || userId} (${role})`);
        }
        catch (e) {
            this.logger.warn(`WS auth failed: ${e.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const clientData = client.data;
        this.logger.log(`WS client disconnected: ${clientData?.userId}`);
    }
    broadcastOrderUpdate(data) {
        this.server.to("dashboard").emit("order:updated", data);
        if (data.orderId) {
            this.server.to(`order:${data.orderId}`).emit("order:updated", data);
        }
    }
    emitOrderCreated(data) {
        this.server.to("dashboard").emit("order:created", data);
    }
    emitOrderStatusChanged(data) {
        this.server.to("dashboard").emit("order:status_changed", data);
        if (data.orderId) {
            this.server.to(`order:${data.orderId}`).emit("order:status_changed", data);
        }
    }
    emitQaInspectionRequested(data) {
        this.server.to("room:management").emit("qa:inspection_requested", data);
        this.server.to("dashboard").emit("qa:inspection_requested", data);
        this.server.to(`order:${data.orderId}`).emit("qa:inspection_requested", data);
    }
    emitMechanicProgress(data) {
        this.server.to("dashboard").emit("mechanic:progress", data);
        if (data.orderId) {
            this.server.to(`order:${data.orderId}`).emit("mechanic:progress", data);
        }
        if (data.mechanicId) {
            this.server.to(`mechanic:${data.mechanicId}`).emit("mechanic:progress", data);
        }
    }
    emitVehicleDelivered(data) {
        this.server.to("dashboard").emit("vehicle:delivered", data);
        if (data.clientId) {
            this.server.to(`client:${data.clientId}`).emit("vehicle:delivered", {
                orderNumber: data.orderNumber,
                vehiclePlate: data.vehiclePlate,
                deliveredAt: data.deliveredAt,
                message: "Tu vehiculo esta listo para recoger",
            });
        }
    }
    emitCashboxClosed(data) {
        this.server.to("dashboard").emit("cashbox:closed", data);
    }
    emitInventoryLowStock(data) {
        this.server.to("dashboard").emit("inventory:low_stock", data);
    }
    emitPaymentReceived(data) {
        this.server.to("dashboard").emit("payment:received", data);
        if (data.isAlert) {
            this.server.to("dashboard").emit("alert:security", {
                type: "UNAUTHORIZED_YAPE",
                description: `Pago sospechoso recibido por ${data.receivedBy}`,
                severity: "CRITICAL",
            });
        }
    }
    emitPersonnelCheckIn(data) {
        this.server.to("dashboard").emit("personnel:check_in", data);
    }
    emitPersonnelCheckOut(data) {
        this.server.to("dashboard").emit("personnel:check_out", data);
    }
    emitVehicleOverdue(data) {
        this.server.to("dashboard").emit("vehicle:overdue", {
            ...data,
            severity: "CRITICAL",
        });
    }
    emitApprovalRequested(data) {
        this.server.to("dashboard").emit("approval:requested", data);
    }
    emitApprovalResolved(data) {
        this.server.to("dashboard").emit("approval:resolved", data);
    }
    emitSecurityAlert(data) {
        this.server.to("dashboard").emit("alert:security", data);
    }
    emitAnomalyDetected(data) {
        this.server.to("dashboard").emit("anomaly:detected", data);
    }
    getSocketUser(client) {
        const data = client.data;
        if (!data?.userId || !data?.role)
            return null;
        return { userId: String(data.userId), role: String(data.role), email: data.email };
    }
    static parseId(data, ...keys) {
        if (typeof data === "string")
            return data || undefined;
        if (typeof data === "object" && data !== null) {
            for (const k of keys) {
                const v = data[k];
                if (typeof v === "string" && v)
                    return v;
            }
        }
        return undefined;
    }
    async canAccessOrder(user, orderId) {
        if (["OWNER", "ADMIN", "FINANCE"].includes(user.role))
            return true;
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            select: { mechanicId: true, clientId: true },
        });
        if (!order)
            return false;
        if (user.role === "MECHANIC" || user.role === "TRAINEE")
            return order.mechanicId === user.userId;
        if (user.role === "CLIENT")
            return order.clientId === user.userId;
        return false;
    }
    async handleStatusChange(client, data) {
        const user = this.getSocketUser(client);
        if (!user)
            return { success: false, error: "No autenticado" };
        const orderId = data?.orderId;
        if (!orderId)
            return { success: false, error: "orderId is required" };
        if (!(await this.canAccessOrder(user, orderId))) {
            return { success: false, error: "No autorizado para esta orden" };
        }
        this.server.to(`order:${orderId}`).emit("order:updated", data);
        return { success: true };
    }
    async handleSubscribe(client, data) {
        const user = this.getSocketUser(client);
        if (!user)
            return { success: false, error: "No autenticado" };
        const orderId = RealtimeGateway_1.parseId(data, "orderId", "id");
        if (!orderId)
            return { success: false, error: "orderId is required" };
        if (!(await this.canAccessOrder(user, orderId))) {
            return { success: false, error: "No autorizado para esta orden" };
        }
        client.join(`order:${orderId}`);
        return { success: true, room: `order:${orderId}` };
    }
    handleUnsubscribe(client, data) {
        const orderId = RealtimeGateway_1.parseId(data, "orderId", "id");
        if (!orderId)
            return { success: false, error: "orderId is required" };
        client.leave(`order:${orderId}`);
        return { success: true };
    }
    async handleMechanicProgress(client, data) {
        const user = this.getSocketUser(client);
        if (!user)
            return { success: false, error: "No autenticado" };
        if (!["MECHANIC", "TRAINEE", "ADMIN", "OWNER"].includes(user.role)) {
            return { success: false, error: "No autorizado" };
        }
        const orderId = data?.orderId;
        if (!orderId)
            return { success: false, error: "orderId is required" };
        const order = await this.prisma.workOrder.findUnique({
            where: { id: orderId },
            select: { id: true, number: true, mechanicId: true },
        });
        if (!order)
            return { success: false, error: "Orden no encontrada" };
        if ((user.role === "MECHANIC" || user.role === "TRAINEE") && order.mechanicId !== user.userId) {
            return { success: false, error: "No autorizado para esta orden" };
        }
        const account = await this.prisma.account.findUnique({
            where: { id: user.userId },
            select: { name: true },
        });
        const mechanicName = account?.name ?? user.email ?? "Mecánico";
        const progressPercent = Math.max(0, Math.min(100, Number(data?.progressPercent) || 0));
        const partsInstalled = Math.max(0, Math.floor(Number(data?.partsInstalled) || 0));
        const laborHours = Math.max(0, Number(data?.laborHours) || 0);
        const notes = typeof data?.notes === "string" ? data.notes.slice(0, 1000) : undefined;
        this.emitMechanicProgress({
            orderId,
            orderNumber: order.number,
            mechanicId: user.userId,
            mechanicName,
            progressPercent,
            currentStatus: "IN_PROGRESS",
            partsInstalled,
            laborHours,
            notes,
            timestamp: new Date().toISOString(),
        });
        try {
            await this.prisma.workOrderEvent.create({
                data: {
                    workOrderId: orderId,
                    event: "PROGRESS_REPORTED",
                    description: notes
                        ? `${mechanicName} registró avance técnico: ${notes} (${progressPercent}%)`
                        : `${mechanicName} reportó avance del ${progressPercent}% - ${partsInstalled} repuestos instalados, ${laborHours}h trabajadas`,
                    metadata: { progressPercent, partsInstalled, laborHours, notes: notes ?? null },
                    userId: user.userId,
                },
            });
            this.logger.log(`Progreso WS persistido en DB: OT ${order.number} - ${mechanicName}`);
        }
        catch (e) {
            this.logger.error(`Error al persistir progreso WS: ${e.message}`);
        }
        return { success: true, eventId: `progress-${Date.now()}` };
    }
    handleClientSubscribe(client, data) {
        const user = this.getSocketUser(client);
        if (!user)
            return { success: false, error: "No autenticado" };
        const clientId = RealtimeGateway_1.parseId(data, "clientId", "id");
        if (!clientId)
            return { success: false, error: "clientId is required" };
        const isMgmt = ["OWNER", "ADMIN", "FINANCE"].includes(user.role);
        if (!isMgmt && user.userId !== clientId) {
            return { success: false, error: "No autorizado para esta sala de cliente" };
        }
        client.join(`client:${clientId}`);
        return { success: true, room: `client:${clientId}` };
    }
    handleClientUnsubscribe(client, data) {
        const clientId = RealtimeGateway_1.parseId(data, "clientId", "id");
        if (!clientId)
            return { success: false, error: "clientId is required" };
        client.leave(`client:${clientId}`);
        return { success: true };
    }
    handleDashboardSubscribe(client) {
        const clientData = client.data;
        if (["OWNER", "ADMIN", "FINANCE"].includes(clientData?.role)) {
            client.join("dashboard");
            return { success: true, room: "dashboard" };
        }
        return { success: false, error: "Unauthorized" };
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("order:status-changed"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleStatusChange", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("order:subscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("order:unsubscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("mechanic:progress"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleMechanicProgress", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("client:subscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleClientSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("client:unsubscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleClientUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("dashboard:subscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleDashboardSubscribe", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGINS?.split(",") ?? [
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://localhost:3004",
            ],
            credentials: true,
        },
        namespace: "/",
        transports: ["websocket"],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        prisma_service_1.PrismaService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map