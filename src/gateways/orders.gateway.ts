import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { Logger } from "@nestjs/common"
import { RedisService } from "../common/redis/redis.service"
import type { AuthenticatedSocket } from "./ws-auth.middleware"
import type { AuthUser } from "../modules/auth/auth.service"

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

@WebSocketGateway({
  namespace: "/ws/orders",
  cors: {
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  },
  transports: ["websocket"],
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class OrdersGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(OrdersGateway.name)

  constructor(private readonly redis: RedisService) {}

  afterInit() {
    this.logger.log("WebSocket Gateway /ws/orders initialized")
  }

  async handleConnection(client: AuthenticatedSocket) {
    const user = client.user

    if (!user) {
      client.disconnect()
      return
    }

    client.join(`user:${user.id}`)
    client.join(`role:${user.role}`)

    await this.redis.client.hset(
      "ws:connections",
      user.id,
      JSON.stringify({
        socketId: client.id,
        role: user.role,
        connectedAt: Date.now(),
      }),
    )

    this.logger.log(`WS client connected: ${user.email} (${user.role})`)
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const user = client.user
    if (user) {
      await this.redis.client.hdel("ws:connections", user.id)
      this.logger.log(`WS client disconnected: ${user.email}`)
    }
  }

  @SubscribeMessage("order:status-changed")
  async handleStatusChange(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: OrderUpdatePayload,
  ) {
    const user = client.user

    this.logger.log(
      `[WS] ${user.name} cambió OT ${data.orderNumber} a ${data.newStatus}`,
    )

    const enrichedData = {
      ...data,
      changedBy: data.changedBy || user.name,
      changedById: data.changedById || user.id,
    }

    this.server.to("role:OWNER").to("role:ADMIN").emit("order:updated", enrichedData)

    if (data.orderId) {
      this.server
        .to(`order:${data.orderId}`)
        .emit("order:updated", enrichedData)
    }

    return { success: true, eventId: `evt-${Date.now()}` }
  }

  @SubscribeMessage("order:subscribe")
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const room = `order:${data.orderId}`
    client.join(room)
    this.logger.debug(`Client joined room ${room}`)
    return { success: true, room }
  }

  @SubscribeMessage("order:unsubscribe")
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ) {
    const room = `order:${data.orderId}`
    client.leave(room)
    return { success: true, room }
  }

  broadcastOrderUpdate(data: OrderUpdatePayload) {
    this.server.to("role:OWNER").to("role:ADMIN").emit("order:updated", data)

    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit("order:updated", data)
    }
  }
}
