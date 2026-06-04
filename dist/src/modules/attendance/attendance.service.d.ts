import { PrismaService } from "../../common/prisma/prisma.service";
import { AttendanceFilterDto } from "./dto/attendance.dto";
export declare class AttendanceService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
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
    getTodayStats(): Promise<{
        today: string;
        present: number;
        absent: number;
        late: number;
        completed: number;
        total: number;
    }>;
    checkIn(personnelId: string, notes?: string): Promise<{
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
    checkOut(personnelId: string, notes?: string): Promise<{
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
    verify(personnelId: string, date: string, verifiedBy: string): Promise<{
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
