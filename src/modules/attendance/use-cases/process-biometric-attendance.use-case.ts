import { Injectable, NotFoundException, Logger } from "@nestjs/common"
import { PrismaService } from "../../../common/prisma/prisma.service"
import { AttendanceType } from "@prisma/client"
import { WorkSchedule } from "../../../domain/personnel"
import { BiometricCheckInDto } from "../dto/attendance.dto"

const VERIFY_METHOD_LABELS: Record<number, string> = {
  1: "huella",
  4: "PIN",
  15: "facial",
}

// Caso de uso del contexto de Personal: recibe eventos de asistencia ya
// sanitizados por ZktecoDeviceAdapter (arellan-hardware-iot), los compara
// contra el horario configurado (Settings.attendance_schedule) y muta el
// estado de asistencia + penalizacion salarial de forma atomica.
@Injectable()
export class ProcessBiometricAttendanceUseCase {
  private readonly logger = new Logger(ProcessBiometricAttendanceUseCase.name)

  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: BiometricCheckInDto) {
    const personnel = await this.prisma.personnel.findUnique({
      where: { dni: dto.dni },
    })
    if (!personnel) {
      throw new NotFoundException(`No existe personal con DNI ${dto.dni}`)
    }

    const checkInAt = new Date(dto.timestamp)

    const date = new Date(checkInAt)
    date.setHours(0, 0, 0, 0)

    const scheduleSetting = await this.prisma.setting.findUnique({
      where: { key: "attendance_schedule" },
    })
    const schedule = WorkSchedule.parse(scheduleSetting?.value ?? null)
    const evaluation = WorkSchedule.evaluate(checkInAt, schedule)

    const verifyMethodLabel = VERIFY_METHOD_LABELS[dto.verifyMethod] ?? `metodo ${dto.verifyMethod}`
    const notes = `Marcado biometrico ZKTeco (dispositivo ${dto.deviceSN}, ${verifyMethodLabel})`
    const type: AttendanceType = evaluation.isLate ? AttendanceType.LATE : AttendanceType.PRESENT

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: { personnelId_date: { personnelId: personnel.id, date } },
      })

      const attendance = existing
        ? await tx.attendance.update({
            where: { id: existing.id },
            data: existing.checkIn ? {} : { checkIn: checkInAt, type, notes },
          })
        : await tx.attendance.create({
            data: { personnelId: personnel.id, date, checkIn: checkInAt, type, notes },
          })

      let penaltyAmount = 0
      if (evaluation.isLate) {
        penaltyAmount = WorkSchedule.calculatePenalty(
          Number(personnel.salary),
          personnel.salaryType,
          evaluation.lateMinutes,
        )

        await tx.auditLog.create({
          data: {
            userId: "system",
            userName: "ZKTeco-Bridge",
            role: "SYSTEM",
            action: "ATTENDANCE_LATE_PENALTY",
            entity: "Personnel",
            entityId: personnel.id,
            severity: "WARNING",
            ipAddress: "iot-bridge",
            metadata: {
              attendanceId: attendance.id,
              dni: dto.dni,
              deviceSN: dto.deviceSN,
              checkIn: checkInAt.toISOString(),
              scheduledStart: evaluation.scheduledStart.toISOString(),
              lateMinutes: evaluation.lateMinutes,
              penaltyAmount,
              salaryType: personnel.salaryType,
            } as any,
          },
        })
      }

      return { attendance, penaltyAmount }
    })

    this.logger.log(
      `Asistencia biometrica: personal=${personnel.id} dni=${dto.dni} estado=${type} tarde=${evaluation.lateMinutes}min`,
    )

    return {
      attendanceId: result.attendance.id,
      personnelId: personnel.id,
      date: result.attendance.date,
      status: type,
      isLate: evaluation.isLate,
      lateMinutes: evaluation.lateMinutes,
      penaltyAmount: result.penaltyAmount,
    }
  }
}
