import { Global, Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { IotBridgeClient } from "./iot-bridge.client"

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>("IOT_BRIDGE_URL", "http://localhost:3007"),
        timeout: 10000,
        headers: { "x-device-key": config.get<string>("IOT_BRIDGE_SHARED_SECRET", "") },
      }),
    }),
  ],
  providers: [IotBridgeClient],
  exports: [IotBridgeClient],
})
export class IotBridgeModule {}
