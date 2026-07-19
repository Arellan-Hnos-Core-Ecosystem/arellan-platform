import { Module, Global } from "@nestjs/common"
import { AntiFraudService } from "./anti-fraud.service"

// SEC-01: el enganche anti-fraude ahora es un interceptor global
// (AntiFraudInterceptor, registrado en AppModule), no un middleware — así corre
// DESPUÉS de la autenticación y dispone de req.user.
@Global()
@Module({
  providers: [AntiFraudService],
  exports: [AntiFraudService],
})
export class AntiFraudModule {}
