"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkSchedule = void 0;
const MINUTES_PER_PERIOD = {
    HOURLY: 60,
    DAILY: 8 * 60,
    WEEKLY: 5 * 8 * 60,
    MONTHLY: 30 * 8 * 60,
};
class WorkSchedule {
    constructor() { }
    static DEFAULT_START_TIME = "08:00";
    static DEFAULT_TOLERANCE_MINUTES = 60;
    static defaultConfig() {
        return {
            startTime: WorkSchedule.DEFAULT_START_TIME,
            toleranceMinutes: WorkSchedule.DEFAULT_TOLERANCE_MINUTES,
        };
    }
    static parse(raw) {
        if (!raw)
            return WorkSchedule.defaultConfig();
        try {
            const parsed = JSON.parse(raw);
            const startTime = typeof parsed.startTime === "string" && /^\d{1,2}:\d{2}$/.test(parsed.startTime)
                ? parsed.startTime
                : WorkSchedule.DEFAULT_START_TIME;
            const toleranceMinutes = typeof parsed.toleranceMinutes === "number" && parsed.toleranceMinutes >= 0
                ? parsed.toleranceMinutes
                : WorkSchedule.DEFAULT_TOLERANCE_MINUTES;
            return { startTime, toleranceMinutes };
        }
        catch {
            return WorkSchedule.defaultConfig();
        }
    }
    static evaluate(checkIn, config) {
        const [hours, minutes] = WorkSchedule.parseTime(config.startTime);
        const scheduledStart = new Date(checkIn);
        scheduledStart.setHours(hours, minutes, 0, 0);
        const diffMinutes = Math.round((checkIn.getTime() - scheduledStart.getTime()) / 60000);
        const lateMinutes = Math.max(0, diffMinutes - config.toleranceMinutes);
        return { isLate: lateMinutes > 0, lateMinutes, scheduledStart };
    }
    static calculatePenalty(salary, salaryType, lateMinutes) {
        if (lateMinutes <= 0)
            return 0;
        const perMinuteRate = salary / MINUTES_PER_PERIOD[salaryType];
        return Math.round(perMinuteRate * lateMinutes * 100) / 100;
    }
    static parseTime(value) {
        const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
        if (!match)
            return [8, 0];
        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59)
            return [8, 0];
        return [hours, minutes];
    }
}
exports.WorkSchedule = WorkSchedule;
//# sourceMappingURL=work-schedule.vo.js.map