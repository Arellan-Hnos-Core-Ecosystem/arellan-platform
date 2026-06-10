import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
interface OrderUpdatePayload {
    orderId: string;
    orderNumber: string;
    newStatus: string;
    vehiclePlate: string;
    mechanicName?: string;
    changedBy?: string;
    changedById?: string;
    timestamp: string;
}
interface MechanicProgressPayload {
    orderId: string;
    orderNumber: string;
    mechanicId: string;
    mechanicName: string;
    progressPercent: number;
    currentStatus: string;
    partsInstalled: number;
    laborHours: number;
    notes?: string;
    timestamp: string;
}
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    private logger;
    constructor(jwtService: JwtService, prisma: PrismaService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    broadcastOrderUpdate(data: OrderUpdatePayload): void;
    emitOrderCreated(data: {
        orderId: string;
        orderNumber: string;
        clientName: string;
        vehiclePlate: string;
    }): void;
    emitOrderStatusChanged(data: {
        orderId: string;
        oldStatus: string;
        newStatus: string;
        updatedBy: string;
    }): void;
    emitQaInspectionRequested(data: {
        orderId: string;
        orderNumber: string;
        mechanicName: string;
        role: string;
        odometerOut: number;
        technicalNotes: string;
    }): void;
    emitMechanicProgress(data: MechanicProgressPayload): void;
    emitVehicleDelivered(data: {
        orderId: string;
        orderNumber: string;
        clientId: string;
        vehiclePlate: string;
        deliveredAt: string;
    }): void;
    emitInventoryLowStock(data: {
        itemId: string;
        itemName: string;
        currentStock: number;
        minStock: number;
    }): void;
    emitPaymentReceived(data: {
        workOrderId: string;
        amount: number;
        method: string;
        receivedBy: string;
        isAlert: boolean;
    }): void;
    emitPersonnelCheckIn(data: {
        personnelId: string;
        name: string;
        timestamp: Date;
    }): void;
    emitPersonnelCheckOut(data: {
        personnelId: string;
        name: string;
        timestamp: Date;
    }): void;
    emitVehicleOverdue(data: {
        vehicleId: string;
        plate: string;
        personnelName: string;
        minutesOverdue: number;
    }): void;
    emitApprovalRequested(data: {
        approvalId: string;
        type: string;
        amount: number;
        requestedBy: string;
    }): void;
    emitApprovalResolved(data: {
        approvalId: string;
        status: string;
        resolvedBy: string;
    }): void;
    emitSecurityAlert(data: {
        type: string;
        description: string;
        severity: string;
        userId?: string;
    }): void;
    emitAnomalyDetected(data: {
        type: string;
        description: string;
        severity: string;
        sessionId?: string;
        userId?: string;
    }): void;
    handleStatusChange(_client: Socket, data: OrderUpdatePayload): {
        success: boolean;
        eventId: string;
    };
    handleSubscribe(client: Socket, data: unknown): {
        success: boolean;
        error: string;
        room?: undefined;
    } | {
        success: boolean;
        room: string;
        error?: undefined;
    };
    handleUnsubscribe(client: Socket, data: unknown): {
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    };
    handleMechanicProgress(_client: Socket, data: MechanicProgressPayload): Promise<{
        success: boolean;
        eventId: string;
    }>;
    handleClientSubscribe(client: Socket, data: unknown): {
        success: boolean;
        error: string;
        room?: undefined;
    } | {
        success: boolean;
        room: string;
        error?: undefined;
    };
    handleClientUnsubscribe(client: Socket, data: unknown): {
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    };
    handleDashboardSubscribe(client: Socket): {
        success: boolean;
        room: string;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        room?: undefined;
    };
}
export {};
