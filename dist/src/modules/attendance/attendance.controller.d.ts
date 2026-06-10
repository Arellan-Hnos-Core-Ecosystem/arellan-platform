import { AttendanceService } from "./attendance.service";
import { AttendanceFilterDto, CheckInDto, CheckOutDto, VerifyAttendanceDto } from "./dto/attendance.dto";
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    findAll(filters: AttendanceFilterDto): Promise<{
        data: ({
            personnel: {
                id: string;
                firstName: string;
                lastName: string;
                position: string;
                account: {
                    id: string;
                    email: string;
                    role: import(".prisma/client").$Enums.UserRole;
                };
            };
        } & {
            id: string;
            personnelId: string;
            date: Date;
            checkIn: Date | null;
            checkOut: Date | null;
            type: import(".prisma/client").$Enums.AttendanceType;
            notes: string | null;
            verifiedBy: string | null;
            createdAt: Date;
            updatedAt: Date;
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
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        notes: string | null;
        verifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    checkIn(dto: CheckInDto): Promise<{
        id: string;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        notes: string | null;
        verifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkOut(dto: CheckOutDto): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        notes: string | null;
        verifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verify(dto: VerifyAttendanceDto): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        personnelId: string;
        date: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        type: import(".prisma/client").$Enums.AttendanceType;
        notes: string | null;
        verifiedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
