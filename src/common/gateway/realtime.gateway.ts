import {
  WebSocketGateway, WebSocketServer,
  OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket'],
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('RealtimeGateway');

  constructor(private jwtService: JwtService) {}

  afterInit() { this.logger.log('Realtime WebSocket Gateway initialized'); }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      (client as any).data = { userId: payload.sub || payload.id, role: payload.role };
      client.join(`role:${payload.role}`);
      client.join(`user:${payload.sub || payload.id}`);
      this.logger.log(`WS client connected: ${payload.email || payload.sub} (${payload.role})`);
    } catch (e) {
      this.logger.warn(`WS auth failed: ${(e as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS client disconnected: ${(client as any).data?.userId}`);
  }

  emitOrderCreated(data: { orderId: string; orderNumber: string; clientName: string; vehiclePlate: string }) {
    this.server.to('role:OWNER').to('role:ADMIN').emit('order:created', data);
  }

  emitOrderStatusChanged(data: { orderId: string; oldStatus: string; newStatus: string; updatedBy: string }) {
    this.server.to('role:OWNER').to('role:ADMIN').to('role:MECHANIC').emit('order:status_changed', data);
    if (data.orderId) {
      this.server.to(`order:${data.orderId}`).emit('order:status_changed', data);
    }
  }

  emitInventoryLowStock(data: { itemId: string; itemName: string; currentStock: number; minStock: number }) {
    this.server.to('role:OWNER').to('role:ADMIN').to('role:FINANCE').emit('inventory:low_stock', data);
  }

  emitPaymentReceived(data: { workOrderId: string; amount: number; method: string; receivedBy: string; isAlert: boolean }) {
    this.server.to('role:OWNER').to('role:FINANCE').emit('payment:received', data);
    if (data.isAlert) {
      this.server.to('role:OWNER').emit('alert:security', {
        type: 'UNAUTHORIZED_YAPE',
        description: `Pago sospechoso recibido por ${data.receivedBy}`,
        severity: 'CRITICAL',
      });
    }
  }

  emitPersonnelCheckIn(data: { personnelId: string; name: string; timestamp: Date }) {
    this.server.to('role:OWNER').to('role:ADMIN').emit('personnel:check_in', data);
  }

  emitPersonnelCheckOut(data: { personnelId: string; name: string; timestamp: Date }) {
    this.server.to('role:OWNER').to('role:ADMIN').emit('personnel:check_out', data);
  }

  emitVehicleOverdue(data: { vehicleId: string; plate: string; personnelName: string; minutesOverdue: number }) {
    this.server.to('role:OWNER').to('role:ADMIN').emit('vehicle:overdue', { ...data, severity: 'CRITICAL' });
  }

  emitApprovalRequested(data: { approvalId: string; type: string; amount: number; requestedBy: string }) {
    this.server.to('role:OWNER').to('role:FINANCE').emit('approval:requested', data);
  }

  emitApprovalResolved(data: { approvalId: string; status: string; resolvedBy: string }) {
    this.server.to('role:OWNER').to('role:FINANCE').emit('approval:resolved', data);
  }

  emitSecurityAlert(data: { type: string; description: string; severity: string; userId?: string }) {
    this.server.to('role:OWNER').emit('alert:security', data);
  }
}
