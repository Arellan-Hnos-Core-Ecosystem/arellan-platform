import { SalaryType } from "@prisma/client";

export interface WorkScheduleConfig {
  startTime: string; // "HH:mm", 24h
  toleranceMinutes: number;
}

export interface AttendanceEvaluation {
  isLate: boolean;
  lateMinutes: number;
  scheduledStart: Date;
}

const MINUTES_PER_PERIOD: Record<SalaryType, number> = {
  HOURLY: 60,
  DAILY: 8 * 60,
  WEEKLY: 5 * 8 * 60,
  MONTHLY: 30 * 8 * 60,
};

export class WorkSchedule {
  private constructor() {}

  static readonly DEFAULT_START_TIME = "08:00";
  // Preserva el comportamiento previo (isLate = hora >= 9) como fallback
  // cuando el setting "attendance_schedule" no esta configurado.
  static readonly DEFAULT_TOLERANCE_MINUTES = 60;

  static defaultConfig(): WorkScheduleConfig {
    return {
      startTime: WorkSchedule.DEFAULT_START_TIME,
      toleranceMinutes: WorkSchedule.DEFAULT_TOLERANCE_MINUTES,
    };
  }

  // El setting "attendance_schedule" es JSON libre administrado desde Settings;
  // cualquier valor ausente o invalido degrada al default sin romper el check-in.
  static parse(raw: string | null | undefined): WorkScheduleConfig {
    if (!raw) return WorkSchedule.defaultConfig();

    try {
      const parsed = JSON.parse(raw);
      const startTime =
        typeof parsed.startTime === "string" && /^\d{1,2}:\d{2}$/.test(parsed.startTime)
          ? parsed.startTime
          : WorkSchedule.DEFAULT_START_TIME;
      const toleranceMinutes =
        typeof parsed.toleranceMinutes === "number" && parsed.toleranceMinutes >= 0
          ? parsed.toleranceMinutes
          : WorkSchedule.DEFAULT_TOLERANCE_MINUTES;

      return { startTime, toleranceMinutes };
    } catch {
      return WorkSchedule.defaultConfig();
    }
  }

  // Compara el timestamp de marcado (hardware o manual) contra el horario
  // configurado. lateMinutes ya descuenta la tolerancia.
  static evaluate(checkIn: Date, config: WorkScheduleConfig): AttendanceEvaluation {
    const [hours, minutes] = WorkSchedule.parseTime(config.startTime);

    const scheduledStart = new Date(checkIn);
    scheduledStart.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.round((checkIn.getTime() - scheduledStart.getTime()) / 60000);
    const lateMinutes = Math.max(0, diffMinutes - config.toleranceMinutes);

    return { isLate: lateMinutes > 0, lateMinutes, scheduledStart };
  }

  // Penalizacion proporcional a los minutos tarde, segun la modalidad salarial
  // del empleado (Regla: tardanza injerta descuento atomico junto al estado LATE).
  static calculatePenalty(salary: number, salaryType: SalaryType, lateMinutes: number): number {
    if (lateMinutes <= 0) return 0;

    const perMinuteRate = salary / MINUTES_PER_PERIOD[salaryType];
    return Math.round(perMinuteRate * lateMinutes * 100) / 100;
  }

  private static parseTime(value: string): [number, number] {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return [8, 0];

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return [8, 0];

    return [hours, minutes];
  }
}
