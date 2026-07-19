import { Global, Module } from "@nestjs/common"
import { IntegrityHashService } from "./integrity-hash.service"
import { SecretCipherService } from "./secret-cipher.service"

@Global()
@Module({
  providers: [IntegrityHashService, SecretCipherService],
  exports: [IntegrityHashService, SecretCipherService],
})
export class CryptoModule {}
