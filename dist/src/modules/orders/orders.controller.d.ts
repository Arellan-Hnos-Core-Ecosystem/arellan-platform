import { OrdersService } from "./orders.service";
import { AuthUser } from "../auth/auth.service";
import { CreateOrderDto, UpdateOrderDto, UpdateStatusDto, OrderFilterDto } from "./dto/orders.dto";
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    findAll(filters: OrderFilterDto): Promise<import("./dto/orders.dto").PaginatedResult<unknown>>;
    findMyOrders(user: AuthUser, filters: OrderFilterDto): Promise<import("./dto/orders.dto").PaginatedResult<unknown>>;
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
                unitPrice: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            createdAt: Date;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
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
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
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
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
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
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto, user: AuthUser): Promise<{
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
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
    remove(id: string): Promise<{
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
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    }>;
}
