import { AttendanceService } from "./attendance.service";
import { AttendanceFilterDto, CheckInDto, CheckOutDto, VerifyAttendanceDto } from "./dto/attendance.dto";
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findAll(filters: AttendanceFilterDto): Promise<{
        data: ({
            personnel: {
                id: string;
                account: {
                    id: string;
                    email: string;
                    role: import(".prisma/client").$Enums.UserRole;
                };
                firstName: string;
                lastName: string;
                position: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            type: import(".prisma/client").$Enums.AttendanceType;
            personnelId: string;
            date: Date;
            checkIn: Date | null;
            checkOut: Date | null;
            verifiedBy: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getTodayStats(): Promise<{
        today: string;
        present: number;
        absent: number;
        late: number;
        completed: number;
        total: number;
    }>;
    getByPersonnel(personnelId: string, from?: string, to?: string): Promise<({
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        verifiedBy: string | null;
    })[]>;
    checkIn(dto: CheckInDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        verifiedBy: string | null;
    }>;
    checkOut(dto: CheckOutDto): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        verifiedBy: string | null;
    }>;
    verify(dto: VerifyAttendanceDto): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        verifiedBy: string | null;
    }>;
}
