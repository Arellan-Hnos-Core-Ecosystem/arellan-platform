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
export declare class RequestPartsItemDto {
    itemId: string;
    quantity: number;
}
export declare class RequestPartsDto {
    items: RequestPartsItemDto[];
}
export declare class VehicleCheckinDto {
    plate: string;
    brand?: string;
    model?: string;
    kilometerReading?: string;
    fuelLevel?: string;
    description?: string;
    photoPositions?: string;
}
export declare class MechanicProgressDto {
    progressPercent: number;
    partsInstalled: number;
    laborHours: number;
    notes?: string;
}
