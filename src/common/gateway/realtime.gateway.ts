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

      if (role === "OWNER" || role === "ADMIN") {
        client.join("room:management")
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

  emitQaInspectionRequested(data: {
    orderId: string
    orderNumber: string
    mechanicName: string
    role: string
    odometerOut: number
    technicalNotes: string
  }) {
    this.server.to("room:management").emit("qa:inspection_requested", data)
    this.server.to("dashboard").emit("qa:inspection_requested", data)
    this.server.to(`order:${data.orderId}`).emit("qa:inspection_requested", data)
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

  emitCashboxClosed(data: { sessionId: string; status: string; closedBy: string }) {
    this.server.to("dashboard").emit("cashbox:closed", data)
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

  emitAnomalyDetected(data: {
    type: string
    description: string
    severity: string
    sessionId?: string
    userId?: string
  }) {
    this.server.to("dashboard").emit("anomaly:detected", data)
  }

  // ─── AUTORIZACIÓN DE SALAS (SEC-13) ────────────────────

  // Identidad de la sesión del socket, poblada en handleConnection a partir del
  // JWT verificado. NUNCA se confía en IDs/nombres provistos en el payload.
  private getSocketUser(
    client: Socket,
  ): { userId: string; role: string; email?: string } | null {
    const data = (client as any).data
    if (!data?.userId || !data?.role) return null
    return { userId: String(data.userId), role: String(data.role), email: data.email }
  }

  private static parseId(data: unknown, ...keys: string[]): string | undefined {
    if (typeof data === "string") return data || undefined
    if (typeof data === "object" && data !== null) {
      for (const k of keys) {
        const v = (data as Record<string, unknown>)[k]
        if (typeof v === "string" && v) return v
      }
    }
    return undefined
  }

  // ¿Puede este usuario acceder a esta OT?
  // - OWNER/ADMIN/FINANCE: sí (paneles de gestión).
  // - MECHANIC/TRAINEE: sólo su OT asignada.
  // - CLIENT: sólo si la OT pertenece a su registro.
  private async canAccessOrder(
    user: { userId: string; role: string },
    orderId: string,
  ): Promise<boolean> {
    if (["OWNER", "ADMIN", "FINANCE"].includes(user.role)) return true
    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      select: { mechanicId: true, clientId: true },
    })
    if (!order) return false
    if (user.role === "MECHANIC" || user.role === "TRAINEE") return order.mechanicId === user.userId
    if (user.role === "CLIENT") return order.clientId === user.userId
    return false
  }

  // ─── SUBSCRIBE MESSAGE HANDLERS ────────────────────────

  @SubscribeMessage("order:status-changed")
  async handleStatusChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: OrderUpdatePayload,
  ) {
    // SEC-13: los cambios de estado reales se emiten desde el backend (REST).
    // Un cliente sólo puede re-emitir a la sala de una OT a la que tenga acceso;
    // se prohíbe difundir al dashboard global desde el socket del cliente.
    const user = this.getSocketUser(client)
    if (!user) return { success: false, error: "No autenticado" }
    const orderId = data?.orderId
    if (!orderId) return { success: false, error: "orderId is required" }
    if (!(await this.canAccessOrder(user, orderId))) {
      return { success: false, error: "No autorizado para esta orden" }
    }
    this.server.to(`order:${orderId}`).emit("order:updated", data)
    return { success: true }
  }

  @SubscribeMessage("order:subscribe")
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const user = this.getSocketUser(client)
    if (!user) return { success: false, error: "No autenticado" }
    const orderId = RealtimeGateway.parseId(data, "orderId", "id")
    if (!orderId) return { success: false, error: "orderId is required" }
    if (!(await this.canAccessOrder(user, orderId))) {
      return { success: false, error: "No autorizado para esta orden" }
    }
    client.join(`order:${orderId}`)
    return { success: true, room: `order:${orderId}` }
  }

  @SubscribeMessage("order:unsubscribe")
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const orderId = RealtimeGateway.parseId(data, "orderId", "id")
    if (!orderId) return { success: false, error: "orderId is required" }
    client.leave(`order:${orderId}`)
    return { success: true }
  }

  @SubscribeMessage("mechanic:progress")
  async handleMechanicProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MechanicProgressPayload,
  ) {
    // SEC-13: identidad y autorización desde la sesión del socket, no del payload.
    // Un mecánico sólo puede reportar avance de SU OT asignada.
    const user = this.getSocketUser(client)
    if (!user) return { success: false, error: "No autenticado" }
    if (!["MECHANIC", "TRAINEE", "ADMIN", "OWNER"].includes(user.role)) {
      return { success: false, error: "No autorizado" }
    }
    const orderId = data?.orderId
    if (!orderId) return { success: false, error: "orderId is required" }

    const order = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      select: { id: true, number: true, mechanicId: true },
    })
    if (!order) return { success: false, error: "Orden no encontrada" }
    if ((user.role === "MECHANIC" || user.role === "TRAINEE") && order.mechanicId !== user.userId) {
      return { success: false, error: "No autorizado para esta orden" }
    }

    // Nombre derivado del servidor (nunca del payload del cliente)
    const account = await this.prisma.account.findUnique({
      where: { id: user.userId },
      select: { name: true },
    })
    const mechanicName = account?.name ?? user.email ?? "Mecánico"

    // Saneado de valores numéricos entrantes
    const progressPercent = Math.max(0, Math.min(100, Number(data?.progressPercent) || 0))
    const partsInstalled = Math.max(0, Math.floor(Number(data?.partsInstalled) || 0))
    const laborHours = Math.max(0, Number(data?.laborHours) || 0)
    const notes = typeof data?.notes === "string" ? data.notes.slice(0, 1000) : undefined

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
    })

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
      })
      this.logger.log(`Progreso WS persistido en DB: OT ${order.number} - ${mechanicName}`)
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
    // SEC-13: sólo gestión, o el propio usuario para su sala.
    const user = this.getSocketUser(client)
    if (!user) return { success: false, error: "No autenticado" }
    const clientId = RealtimeGateway.parseId(data, "clientId", "id")
    if (!clientId) return { success: false, error: "clientId is required" }
    const isMgmt = ["OWNER", "ADMIN", "FINANCE"].includes(user.role)
    if (!isMgmt && user.userId !== clientId) {
      return { success: false, error: "No autorizado para esta sala de cliente" }
    }
    client.join(`client:${clientId}`)
    return { success: true, room: `client:${clientId}` }
  }

  @SubscribeMessage("client:unsubscribe")
  handleClientUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ) {
    const clientId = RealtimeGateway.parseId(data, "clientId", "id")
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
