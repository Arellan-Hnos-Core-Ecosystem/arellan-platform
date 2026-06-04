import { Module } from "@nestjs/common"
import { InventoryController } from "./inventory.controller"
import { InventoryService } from "./inventory.service"
import { CacheManagerService } from "../../common/cache/cache-manager.service"

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
