import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../../modules/orders/orders.service";
import { ProcessBiometricAttendanceUseCase } from "../../modules/attendance/use-cases/process-biometric-attendance.use-case";
import { CameraCaptureDto } from "../../modules/orders/dto/orders.dto";
import { BiometricCheckInDto } from "../../modules/attendance/dto/attendance.dto";
export declare class PublicController {
    private readonly prisma;
    private readonly ordersService;
    private readonly processBiometricAttendanceUseCase;
    constructor(prisma: PrismaService, ordersService: OrdersService, processBiometricAttendanceUseCase: ProcessBiometricAttendanceUseCase);
    lookup(plate?: string, code?: string): Promise<{
        found: boolean;
        message: string;
        vehicle?: undefined;
        activeOrder?: undefined;
        order?: undefined;
    } | {
        found: boolean;
        vehicle: {
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
        };
        activeOrder: null;
        message?: undefined;
        order?: undefined;
    } | {
        found: boolean;
        vehicle: {
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
        };
        order: {
            id: string;
            number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            description: string;
            receivedAt: Date;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
            statusHistory: {
                status: import("@prisma/client").$Enums.OrderStatus;
                timestamp: Date;
            }[];
        };
        message?: undefined;
        activeOrder?: undefined;
    }>;
    getOrder(id: string): Promise<{
        found: boolean;
        message: string;
        vehicle?: undefined;
        order?: undefined;
    } | {
        found: boolean;
        vehicle: {
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
        };
        order: {
            id: string;
            number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            description: string;
            receivedAt: Date;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
            statusHistory: {
                status: string;
                timestamp: Date;
            }[];
        };
        message?: undefined;
    }>;
    getOrderByNumber(orderNumber: string): Promise<{
        found: boolean;
        message: string;
        order?: undefined;
    } | {
        found: boolean;
        order: {
            number: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            description: string;
            client: {
                firstName: string;
            };
            vehicle: {
                plate: string;
                brand: string;
                model: string;
                year: number;
                color: string | null;
            };
            receivedAt: Date;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
            statusHistory: {
                status: import("@prisma/client").$Enums.OrderStatus;
                timestamp: Date;
            }[];
        };
        message?: undefined;
    }>;
    biometricAttendance(dto: BiometricCheckInDto): Promise<{
        attendanceId: string;
        personnelId: string;
        date: Date;
        status: "PRESENT" | "LATE";
        isLate: boolean;
        lateMinutes: number;
        penaltyAmount: number;
    }>;
    cameraCapture(id: string, dto: CameraCaptureDto): Promise<{
        orderId: string;
        orderNumber: string;
        position: string;
        hash: string;
        photoCount: number;
    }>;
}
