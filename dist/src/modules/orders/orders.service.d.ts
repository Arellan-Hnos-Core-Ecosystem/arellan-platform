import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto, PaginatedResult } from "./dto/orders.dto";
export declare class OrdersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateOrderDto): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    findAll(filters: OrderFilterDto): Promise<PaginatedResult<unknown>>;
    findOne(id: string): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
        photos: {
            id: string;
            createdAt: Date;
            type: string;
            orderId: string;
            url: string;
            hash: string;
        }[];
        parts: ({
            item: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                sku: string;
                category: string;
                stock: number;
                minStock: number;
                unitPrice: Prisma.Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            unitPrice: Prisma.Decimal;
            orderId: string;
            quantity: number;
            itemId: string;
        })[];
        statusHistory: {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            timestamp: Date;
            orderId: string;
            changedBy: string;
        }[];
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    update(id: string, dto: UpdateOrderDto): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto, userId: string): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    softDelete(id: string): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    assignMechanic(id: string, mechanicId: string): Promise<{
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        vehicle: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        };
        mechanic: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: Prisma.Decimal | null;
        partsCost: Prisma.Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: Prisma.Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    findByMechanic(mechanicId: string, filters: OrderFilterDto): Promise<PaginatedResult<unknown>>;
}
