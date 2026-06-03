import { Module } from "@nestjs/common"
import { OrdersGateway } from "./orders.gateway"
import { WsAuthMiddleware } from "./ws-auth.middleware"
import { JwtModule } from "@nestjs/jwt"
import { ConfigModule, ConfigService } from "@nestjs/config"

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  providers: [OrdersGateway, WsAuthMiddleware],
  exports: [OrdersGateway],
})
export class GatewaysModule {}
