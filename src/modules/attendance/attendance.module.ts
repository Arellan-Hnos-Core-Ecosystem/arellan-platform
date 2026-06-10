import { Module } from "@nestjs/common"
import { AttendanceController } from "./attendance.controller"
import { AttendanceService } from "./attendance.service"
import { ProcessBiometricAttendanceUseCase } from "./use-cases/process-biometric-attendance.use-case"

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, ProcessBiometricAttendanceUseCase],
  exports: [AttendanceService, ProcessBiometricAttendanceUseCase],
})
export class AttendanceModule {}
