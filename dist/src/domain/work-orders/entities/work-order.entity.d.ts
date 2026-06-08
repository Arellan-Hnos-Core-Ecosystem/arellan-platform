import { Money } from "../value-objects/money.vo";
import { OrderStatus } from "../value-objects/order-status.vo";
export interface WorkOrderProps {
    id: string;
    orderNumber: number;
    clientId: string;
    vehicleId: string;
    mechanicId: string | null;
    status: OrderStatus;
    laborCost: Money;
    partsCost: Money;
    discount: Money;
    description: string;
    observations: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateWorkOrderParams {
    id: string;
    orderNumber: number;
    clientId: string;
    vehicleId: string;
    description: string;
}
export declare class WorkOrder {
    private readonly props;
    private constructor();
    static create(params: CreateWorkOrderParams): WorkOrder;
    static reconstitute(props: WorkOrderProps): WorkOrder;
    get id(): string;
    get orderNumber(): number;
    get clientId(): string;
    get vehicleId(): string;
    get mechanicId(): string | null;
    get status(): OrderStatus;
    get laborCost(): Money;
    get partsCost(): Money;
    get discount(): Money;
    get description(): string;
    get observations(): string | null;
    get completedAt(): Date | null;
    get createdAt(): Date;
    get updatedAt(): Date;
    get totalCost(): Money;
    transitionTo(nextStatus: OrderStatus): WorkOrder;
    assignMechanic(mechanicId: string): WorkOrder;
    applyDiscount(discount: Money): WorkOrder;
    assertCanStartProgress(hasParts: boolean): void;
    static readonly REQUIRED_CHECKIN_POSITIONS: readonly ["FRONT", "BACK", "LEFT", "RIGHT", "DASHBOARD"];
    static assertCheckinPhotoPositions(suppliedPositions: string[]): void;
    canDeliver(totalPaid: Money): boolean;
    pendingBalance(totalPaid: Money): Money;
}
