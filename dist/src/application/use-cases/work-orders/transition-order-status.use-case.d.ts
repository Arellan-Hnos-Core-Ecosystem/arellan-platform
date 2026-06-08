import { IWorkOrderRepository } from "../../../domain/work-orders/ports/i-work-order.repository";
export interface TransitionStatusCommand {
    orderId: string;
    targetStatus: string;
    comment?: string;
    totalPaidSoles?: number;
    requestedById: string;
}
export declare class TransitionOrderStatusUseCase {
    private readonly repo;
    constructor(repo: IWorkOrderRepository);
    execute(cmd: TransitionStatusCommand): Promise<void>;
}
