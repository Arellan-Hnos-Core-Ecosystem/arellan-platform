import { AttendanceType } from "@prisma/client";
export declare class AttendanceFilterDto {
    search?: string;
    type?: AttendanceType;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
export declare class CheckInDto {
    personnelId: string;
    notes?: string;
}
export declare class CheckOutDto {
    personnelId: string;
    notes?: string;
}
export declare class VerifyAttendanceDto {
    personnelId: string;
    date: string;
    verifiedBy: string;
}
export declare class PersonnelDateRangeDto {
    personnelId: string;
    from?: string;
    to?: string;
}
