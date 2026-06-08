import { WorkOrder } from "../../../domain/work-orders/entities/work-order.entity";
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

export class CreateWorkOrderUseCase {
  constructor(private readonly repo: IWorkOrderRepository) {}

  async execute(cmd: CreateWorkOrderCommand): Promise<CreateWorkOrderResult> {
    const [id, orderNumber] = await Promise.all([
      Promise.resolve(crypto.randomUUID()),
      this.repo.nextOrderNumber(),
    ]);

    const order = WorkOrder.create({
      id,
      orderNumber,
      clientId: cmd.clientId,
      vehicleId: cmd.vehicleId,
      description: cmd.description,
    });

    const saved = await this.repo.save(order);

    return {
      id: saved.id,
      orderNumber: saved.orderNumber,
      status: saved.status.value,
      clientId: saved.clientId,
      vehicleId: saved.vehicleId,
    };
  }
}
