import { Global, Module } from "@nestjs/common"
import { CacheManagerService } from "./cache-manager.service"

@Global()
@Module({
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheModule {}
