import { WorkOrder } from "../entities/work-order.entity";
export interface WorkOrderFilters {
    status?: string;
    mechanicId?: string;
    clientId?: string;
    vehicleId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
export interface PagedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface IWorkOrderRepository {
    findById(id: string): Promise<WorkOrder | null>;
    findByOrderNumber(orderNumber: number): Promise<WorkOrder | null>;
    findAll(filters: WorkOrderFilters): Promise<PagedResult<WorkOrder>>;
    nextOrderNumber(): Promise<number>;
    save(order: WorkOrder): Promise<WorkOrder>;
    update(order: WorkOrder): Promise<WorkOrder>;
}
