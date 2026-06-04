import { Module } from "@nestjs/common"
import { VehiclesController } from "./vehicles.controller"
import { VehiclesService } from "./vehicles.service"
import { CacheManagerService } from "../../common/cache/cache-manager.service"

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
