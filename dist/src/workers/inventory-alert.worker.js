"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InventoryAlertWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAlertWorker = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../common/prisma/prisma.service");
const realtime_gateway_1 = require("../common/gateway/realtime.gateway");
let InventoryAlertWorker = InventoryAlertWorker_1 = class InventoryAlertWorker {
    prisma;
    realtimeGateway;
    logger = new common_1.Logger(InventoryAlertWorker_1.name);
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async checkInventoryLevels() {
        this.logger.log("Checking inventory levels...");
        const items = await this.prisma.inventoryItem.findMany({
            where: { isActive: true },
        });
        const criticalItems = items.filter((i) => i.stock <= i.minStock);
        for (const item of criticalItems) {
            this.realtimeGateway.emitInventoryLowStock({
                itemId: item.id,
                itemName: item.name,
                currentStock: item.stock,
                minStock: item.minStock,
            });
            this.logger.warn(`Stock critico: ${item.name} (${item.stock}/${item.minStock})`);
        }
        this.logger.log(`Inventory check complete. ${criticalItems.length} critical items.`);
    }
};
exports.InventoryAlertWorker = InventoryAlertWorker;
__decorate([
    (0, schedule_1.Cron)("0 */6 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryAlertWorker.prototype, "checkInventoryLevels", null);
exports.InventoryAlertWorker = InventoryAlertWorker = InventoryAlertWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], InventoryAlertWorker);
//# sourceMappingURL=inventory-alert.worker.js.map