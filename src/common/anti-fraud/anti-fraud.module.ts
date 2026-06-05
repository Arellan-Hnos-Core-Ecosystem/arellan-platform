import { Module, Global, MiddlewareConsumer, NestModule, RequestMethod } from "@nestjs/common"
import { AntiFraudService } from "./anti-fraud.service"
import { AntiFraudMiddleware } from "./anti-fraud.middleware"

@Global()
@Module({
  providers: [AntiFraudService],
  exports: [AntiFraudService],
})
export class AntiFraudModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AntiFraudMiddleware).forRoutes({ path: "/api/v1/*path", method: RequestMethod.ALL })
  }
}
