import { IWorkOrderRepository } from "../../../domain/work-orders/ports/i-work-order.repository";
export interface CreateWorkOrderCommand {
    clientId: string;
    vehicleId: string;
    description: string;
    requestedById: string;
}
export interface CreateWorkOrderResult {
    id: string;
    orderNumber: number;
    status: string;
    clientId: string;
    vehicleId: string;
}
export declare class CreateWorkOrderUseCase {
    private readonly repo;
    constructor(repo: IWorkOrderRepository);
    execute(cmd: CreateWorkOrderCommand): Promise<CreateWorkOrderResult>;
}
