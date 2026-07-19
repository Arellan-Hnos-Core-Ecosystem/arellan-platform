"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../orders.service");
const ORDER_ID = "order-1";
const ASSIGNED_MECHANIC = "mech-1";
const OWNING_CLIENT = "client-1";
function buildService(order) {
    const prisma = {
        workOrder: { findUnique: jest.fn().mockResolvedValue(order) },
    };
    const service = new orders_service_1.OrdersService(prisma, {}, {}, {});
    return { service, prisma };
}
const ORDER = { id: ORDER_ID, mechanicId: ASSIGNED_MECHANIC, clientId: OWNING_CLIENT };
describe("OrdersService.findOne authorization (SEC-20 / BOLA)", () => {
    it("returns 404 when the order does not exist", async () => {
        const { service } = buildService(null);
        await expect(service.findOne(ORDER_ID)).rejects.toThrow(common_1.NotFoundException);
    });
    it("lets management (ADMIN/OWNER/FINANCE) read any order", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID, { id: "someone", role: "ADMIN" })).resolves.toMatchObject({ id: ORDER_ID });
        await expect(service.findOne(ORDER_ID, { id: "someone", role: "FINANCE" })).resolves.toMatchObject({ id: ORDER_ID });
    });
    it("lets the assigned mechanic read their own order", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID, { id: ASSIGNED_MECHANIC, role: "MECHANIC" })).resolves.toMatchObject({ id: ORDER_ID });
    });
    it("hides another mechanic's order as 404 (no existence leak)", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID, { id: "mech-2", role: "MECHANIC" })).rejects.toThrow(common_1.NotFoundException);
    });
    it("blocks a TRAINEE that is not assigned", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID, { id: "trainee-x", role: "TRAINEE" })).rejects.toThrow(common_1.NotFoundException);
    });
    it("lets the owning client read their own order but blocks others", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID, { id: OWNING_CLIENT, role: "CLIENT" })).resolves.toMatchObject({ id: ORDER_ID });
        await expect(service.findOne(ORDER_ID, { id: "client-2", role: "CLIENT" })).rejects.toThrow(common_1.NotFoundException);
    });
    it("keeps internal callers (no requester) unrestricted", async () => {
        const { service } = buildService(ORDER);
        await expect(service.findOne(ORDER_ID)).resolves.toMatchObject({ id: ORDER_ID });
    });
});
//# sourceMappingURL=find-one-authz.spec.js.map