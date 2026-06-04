import { OrderStatus } from "@prisma/client";
export declare class CreateOrderDto {
    vehicleId: string;
    clientId: string;
    mechanicId: string;
    description: string;
}
export declare class UpdateOrderDto {
    status?: OrderStatus;
    diagnosis?: string;
    laborCost?: number;
    partsCost?: number;
    estimatedDelivery?: string;
}
export declare class UpdateStatusDto {
    status: OrderStatus;
}
export declare class AssignMechanicDto {
    mechanicId: string;
}
export declare class ApplyDiscountDto {
    discountAmount?: number;
    discountPercentage?: number;
    reason: string;
}
export declare class OrderFilterDto {
    status?: OrderStatus;
    mechanicId?: string;
    from?: string;
    to?: string;
    limit?: number;
    cursor?: string;
}
export interface PaginatedResult<T> {
    data: T[];
    nextCursor: string | null;
}
