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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let RealtimeGateway = class RealtimeGateway {
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
    handleStatusChange(_client, data) {
        this.broadcastOrderUpdate(data);
        return { success: true, eventId: `evt-${Date.now()}` };
    }
    handleSubscribe(client, data) {
        let orderId;
        if (!data) {
            return { success: false, error: "orderId is required" };
        }
        if (typeof data === "string") {
            orderId = data;
        }
        else if (typeof data === "object" && data !== null) {
            orderId = data.orderId || data.id;
        }
        if (!orderId) {
            return { success: false, error: "orderId is required" };
        }
        client.join(`order:${orderId}`);
        return { success: true, room: `order:${orderId}` };
    }
    handleUnsubscribe(client, data) {
        const orderId = typeof data === "string" ? data : data?.orderId || data?.id;
        if (!orderId)
            return { success: false, error: "orderId is required" };
        client.leave(`order:${orderId}`);
        return { success: true };
    }
    async handleMechanicProgress(_client, data) {
        this.emitMechanicProgress({
            ...data,
            timestamp: data.timestamp || new Date().toISOString(),
        });
        try {
            await this.prisma.workOrderEvent.create({
                data: {
                    workOrderId: data.orderId,
                    event: "PROGRESS_REPORTED",
                    description: data.notes
                        ? `${data.mechanicName} registró avance técnico: ${data.notes} (${data.progressPercent}%)`
                        : `${data.mechanicName} reportó avance del ${data.progressPercent}% - ${data.partsInstalled} repuestos instalados, ${data.laborHours}h trabajadas`,
                    metadata: {
                        progressPercent: data.progressPercent,
                        partsInstalled: data.partsInstalled,
                        laborHours: data.laborHours,
                        notes: data.notes ?? null,
                    },
                    userId: data.mechanicId,
                },
            });
            this.logger.log(`Progreso WS persistido en DB: OT ${data.orderNumber || data.orderId} - ${data.mechanicName}`);
        }
        catch (e) {
            this.logger.error(`Error al persistir progreso WS: ${e.message}`);
        }
        return { success: true, eventId: `progress-${Date.now()}` };
    }
    handleClientSubscribe(client, data) {
        const clientId = typeof data === "string" ? data : data?.clientId || data?.id;
        if (!clientId)
            return { success: false, error: "clientId is required" };
        client.join(`client:${clientId}`);
        return { success: true, room: `client:${clientId}` };
    }
    handleClientUnsubscribe(client, data) {
        const clientId = typeof data === "string" ? data : data?.clientId || data?.id;
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
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleStatusChange", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("order:subscribe"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
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
exports.RealtimeGateway = RealtimeGateway = __decorate([
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