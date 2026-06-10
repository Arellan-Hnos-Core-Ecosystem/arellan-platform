import { Module } from "@nestjs/common"
import { PublicController } from "./public.controller"
import { OrdersModule } from "../../modules/orders/orders.module"
import { AttendanceModule } from "../../modules/attendance/attendance.module"

@Module({
  imports: [OrdersModule, AttendanceModule],
  controllers: [PublicController],
})
export class PublicModule {}
