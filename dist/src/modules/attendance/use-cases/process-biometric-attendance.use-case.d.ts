import { PrismaService } from "../../../common/prisma/prisma.service";
import { BiometricCheckInDto } from "../dto/attendance.dto";
export declare class ProcessBiometricAttendanceUseCase {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(dto: BiometricCheckInDto): Promise<{
        attendanceId: string;
        personnelId: string;
        date: Date;
        status: "PRESENT" | "LATE";
        isLate: boolean;
        lateMinutes: number;
        penaltyAmount: number;
    }>;
}
