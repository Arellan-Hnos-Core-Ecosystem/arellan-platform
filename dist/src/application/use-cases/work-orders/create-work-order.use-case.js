"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkOrderUseCase = void 0;
const work_order_entity_1 = require("../../../domain/work-orders/entities/work-order.entity");
class CreateWorkOrderUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        const [id, orderNumber] = await Promise.all([
            Promise.resolve(crypto.randomUUID()),
            this.repo.nextOrderNumber(),
        ]);
        const order = work_order_entity_1.WorkOrder.create({
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
exports.CreateWorkOrderUseCase = CreateWorkOrderUseCase;
//# sourceMappingURL=create-work-order.use-case.js.map