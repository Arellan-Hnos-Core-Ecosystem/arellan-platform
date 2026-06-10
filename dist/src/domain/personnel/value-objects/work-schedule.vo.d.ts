import { SalaryType } from "@prisma/client";
export interface WorkScheduleConfig {
    startTime: string;
    toleranceMinutes: number;
}
export interface AttendanceEvaluation {
    isLate: boolean;
    lateMinutes: number;
    scheduledStart: Date;
}
export declare class WorkSchedule {
    private constructor();
    static readonly DEFAULT_START_TIME = "08:00";
    static readonly DEFAULT_TOLERANCE_MINUTES = 60;
    static defaultConfig(): WorkScheduleConfig;
    static parse(raw: string | null | undefined): WorkScheduleConfig;
    static evaluate(checkIn: Date, config: WorkScheduleConfig): AttendanceEvaluation;
    static calculatePenalty(salary: number, salaryType: SalaryType, lateMinutes: number): number;
    private static parseTime;
}
