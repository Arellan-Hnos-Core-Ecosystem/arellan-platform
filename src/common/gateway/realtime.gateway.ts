import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
  ConnectedSocket, MessageBody,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { Logger, Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { PrismaService } from "../prisma/prisma.service"

interface OrderUpdatePayload {
  orderId: string
  orderNumber: string
  newStatus: string
  vehiclePlate: string
  mechanicName?: string
  changedBy?: string
  changedById?: string
  timestamp: string
}

interface MechanicProgressPayload {
  orderId: string
  orderNumber: string
  mechanicId: string
  mechanicName: string
  progressPercent: number
  currentStatus: string
  partsInstalled: number
  laborHours: number
  notes?: string
  timestamp: string
}

@Injectable()
@WebSocketGateway({
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
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private logger = new Logger("RealtimeGateway")

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    this.logger.log("Realtime WebSocket Gateway initialized")
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "")

      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token)
      const userId = payload.sub || payload.id
      const role = payload.role

      ;(client as any).data = { userId, role, email: payload.email }

      client.join(`role:${role}`)
      client.join(`user:${userId}`)

      if (role === "MECHANIC" || role === "TRAINEE") {
        client.join(`mechanic:${userId}`)
      }

      if (role === "CLIENT") {
        client.join(`client:${userId}`)
      }

      if (role === "OWNER" || role === "ADMIN" || role === "FINANCE") {
        client.join("dashboard")
      }

      this.logger.log(
        `WS client connected: ${payload.email || userId} (${role})`
      )
    } catch (e) {
      this.logger.warn(`WS auth failed: ${(e as Error).message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const clientData = (client as any).data
    this.logger.log(`WS client disconnected: ${clientData?.userId}`)
  }

  // ─── BROADCAST / EMIT HELPERS ───────────────────────────

  broadcastOrderUpdate(data: OrderUpdatePayload) {
    this.server.to("dashboard").emit("order:updated", data)
    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit("order:updated", data)
    }
  }

  emitOrderCreated(data: {
    orderId: string
    orderNumber: string
    clientName: string
    vehiclePlate: string
  }) {
    this.server.to("dashboard").emit("order:created", data)
  }

  emitOrderStatusChanged(data: {
    orderId: string
    oldStatus: string
    newStatus: string
    updatedBy: string
  }) {
    this.server.to("dashboard").emit("order:status_changed", data)
    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit("order:status_changed", data)
    }
  }

  emitMechanicProgress(data: MechanicProgressPayload) {
    this.server.to("dashboard").emit("mechanic:progress", data)
    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit("mechanic:progress", data)
    }
    if (data.mechanicId) {
      this.server.to(`mechanic:${data.mechanicId}`).emit("mechanic:progress", data)
    }
  }

  emitVehicleDelivered(data: {
    orderId: string
    orderNumber: string
    clientId: string
    vehiclePlate: string
    deliveredAt: string
  }) {
    this.server.to("dashboard").emit("vehicle:delivered", data)
    if (data.clientId) {
      this.server.to(`client:${data.clientId}`).emit("vehicle:delivered", {
        orderNumber: data.orderNumber,
        vehiclePlate: data.vehiclePlate,
        deliveredAt: data.deliveredAt,
        message: "Tu vehiculo esta listo para recoger",
      })
    }
  }

  emitInventoryLowStock(data: {
    itemId: string
    itemName: string
    currentStock: number
    minStock: number
  }) {
    this.server.to("dashboard").emit("inventory:low_stock", data)
  }

  emitPaymentReceived(data: {
    workOrderId: string
    amount: number
    method: string
    receivedBy: string
    isAlert: boolean
  }) {
    this.server.to("dashboard").emit("payment:received", data)
    if (data.isAlert) {
      this.server.to("dashboard").emit("alert:security", {
        type: "UNAUTHORIZED_YAPE",
        description: `Pago sospechoso recibido por ${data.receivedBy}`,
        severity: "CRITICAL",
      })
    }
  }

  emitPersonnelCheckIn(data: {
    personnelId: string
    name: string
    timestamp: Date
  }) {
    this.server.to("dashboard").emit("personnel:check_in", data)
  }

  emitPersonnelCheckOut(data: {
    personnelId: string
    name: string
    timestamp: Date
  }) {
    this.server.to("dashboard").emit("personnel:check_out", data)
  }

  emitVehicleOverdue(data: {
    vehicleId: string
    plate: string
    personnelName: string
    minutesOverdue: number
  }) {
    this.server.to("dashboard").emit("vehicle:overdue", {
      ...data,
      severity: "CRITICAL",
    })
  }

  emitApprovalRequested(data: {
    approvalId: string
    type: string
    amount: number
    requestedBy: string
  }) {
    this.server.to("dashboard").emit("approval:requested", data)
  }

  emitApprovalResolved(data: {
    approvalId: string
    status: string
    resolvedBy: string
  }) {
    this.server.to("dashboard").emit("approval:resolved", data)
  }

  emitSecurityAlert(data: {
    type: string
    description: string
    severity: string
    userId?: string
  }) {
    this.server.to("dashboard").emit("alert:security", data)
  }

  // ─── SUBSCRIBE MESSAGE HANDLERS ────────────────────────

  @SubscribeMessage("order:status-changed")
  handleStatusChange(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: OrderUpdatePayload,
  ) {
    this.broadcastOrderUpdate(data)
    return { success: true, eventId: `evt-${Date.now()}` }
  }

  @SubscribeMessage("order:subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    let orderId: string | undefined

    if (!data) {
      return { success: false, error: "orderId is required" }
    }

    if (typeof data === "string") {
      orderId = data
    } else if (typeof data === "object" && data !== null) {
      orderId = (data as any).orderId || (data as any).id
    }

    if (!orderId) {
      return { success: false, error: "orderId is required" }
    }

    client.join(`order:${orderId}`)
    return { success: true, room: `order:${orderId}` }
  }

  @SubscribeMessage("order:unsubscribe")
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const orderId = typeof data === "string" ? data : (data as any)?.orderId || (data as any)?.id
    if (!orderId) return { success: false, error: "orderId is required" }
    client.leave(`order:${orderId}`)
    return { success: true }
  }

  @SubscribeMessage("mechanic:progress")
  async handleMechanicProgress(
    @ConnectedSocket() _client: Socket,
    @MessageBody() data: MechanicProgressPayload,
  ) {
    this.emitMechanicProgress({
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    })

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
      })
      this.logger.log(`Progreso WS persistido en DB: OT ${data.orderNumber || data.orderId} - ${data.mechanicName}`)
    } catch (e) {
      this.logger.error(`Error al persistir progreso WS: ${(e as Error).message}`)
    }

    return { success: true, eventId: `progress-${Date.now()}` }
  }

  @SubscribeMessage("client:subscribe")
  handleClientSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const clientId = typeof data === "string" ? data : (data as any)?.clientId || (data as any)?.id
    if (!clientId) return { success: false, error: "clientId is required" }
    client.join(`client:${clientId}`)
    return { success: true, room: `client:${clientId}` }
  }

  @SubscribeMessage("client:unsubscribe")
  handleClientUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const clientId = typeof data === "string" ? data : (data as any)?.clientId || (data as any)?.id
    if (!clientId) return { success: false, error: "clientId is required" }
    client.leave(`client:${clientId}`)
    return { success: true }
  }

  @SubscribeMessage("dashboard:subscribe")
  handleDashboardSubscribe(@ConnectedSocket() client: Socket) {
    const clientData = (client as any).data
    if (["OWNER", "ADMIN", "FINANCE"].includes(clientData?.role)) {
      client.join("dashboard")
      return { success: true, room: "dashboard" }
    }
    return { success: false, error: "Unauthorized" }
  }
}
