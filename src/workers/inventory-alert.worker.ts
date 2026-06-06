import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { PrismaService } from "../common/prisma/prisma.service"
import { RealtimeGateway } from "../common/gateway/realtime.gateway"

@Injectable()
export class InventoryAlertWorker {
  private readonly logger = new Logger(InventoryAlertWorker.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Cron("0 */6 * * *")
  async checkInventoryLevels() {
    this.logger.log("Checking inventory levels...")
    const items = await this.prisma.inventoryItem.findMany({
      where: { isActive: true },
    })
    const criticalItems = items.filter((i) => i.stock <= i.minStock)

    for (const item of criticalItems) {
      this.realtimeGateway.emitInventoryLowStock({
        itemId: item.id,
        itemName: item.name,
        currentStock: item.stock,
        minStock: item.minStock,
      })
      this.logger.warn(`Stock critico: ${item.name} (${item.stock}/${item.minStock})`)
    }
    this.logger.log(`Inventory check complete. ${criticalItems.length} critical items.`)
  }
}
