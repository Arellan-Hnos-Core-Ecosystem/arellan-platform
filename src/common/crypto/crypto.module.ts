import { Global, Module } from "@nestjs/common"
import { IntegrityHashService } from "./integrity-hash.service"

@Global()
@Module({
  providers: [IntegrityHashService],
  exports: [IntegrityHashService],
})
export class CryptoModule {}
