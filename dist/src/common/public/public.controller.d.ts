import { PrismaService } from "../prisma/prisma.service";
export declare class PublicController {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
            status: import(".prisma/client").$Enums.OrderStatus;
            description: string;
            receivedAt: Date;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
            statusHistory: {
                status: import(".prisma/client").$Enums.OrderStatus;
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
            status: import(".prisma/client").$Enums.OrderStatus;
            description: string;
            diagnosis: string | null;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
            receivedAt: Date;
            estimatedDelivery: Date | null;
            deliveredAt: Date | null;
            statusHistory: {
                status: import(".prisma/client").$Enums.OrderStatus;
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
            status: import(".prisma/client").$Enums.OrderStatus;
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
                status: import(".prisma/client").$Enums.OrderStatus;
                timestamp: Date;
            }[];
        };
        message?: undefined;
    }>;
}
