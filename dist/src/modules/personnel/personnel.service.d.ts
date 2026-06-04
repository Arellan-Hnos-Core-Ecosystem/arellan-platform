import { PrismaService } from "../../common/prisma/prisma.service";
import { UserRole, AccountStatus, Prisma } from "@prisma/client";
import { CreatePersonnelDto, UpdatePersonnelDto, PersonnelFilterDto, AuthorizeVehicleUsageDto } from "./dto/personnel.dto";
export declare class PersonnelService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filters: PersonnelFilterDto): Promise<{
        data: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            lastLoginAt: Date | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        account: {
            id: string;
            email: string;
            mfaEnabled: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        personnel: ({
            attendance: {
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
            }[];
            vehicleUsages: ({
                vehicle: {
                    id: string;
                    status: import(".prisma/client").$Enums.VehicleStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    notes: string | null;
                    plate: string;
                    brand: string;
                    model: string;
                    year: number;
                    color: string | null;
                    vin: string | null;
                    engineType: import(".prisma/client").$Enums.EngineType;
                    engineCC: number | null;
                    mileage: number | null;
                    fuelType: import(".prisma/client").$Enums.FuelType;
                    transmission: import(".prisma/client").$Enums.TransmissionType;
                    clientId: string;
                    photos: string[];
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.UsageStatus;
                createdAt: Date;
                updatedAt: Date;
                notes: string | null;
                vehicleId: string;
                odometerIn: number | null;
                odometerOut: number | null;
                personnelId: string;
                authorizedBy: string | null;
                purpose: string;
                destination: string | null;
                expectedReturn: Date;
                checkoutAt: Date;
                returnAt: Date | null;
            })[];
            _count: {
                attendance: number;
                vehicleUsages: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            accountId: string;
            dni: string;
            pin: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            emergencyPhone: string | null;
            address: string | null;
            birthDate: Date | null;
            nationality: string;
            contractType: import(".prisma/client").$Enums.ContractType;
            position: string;
            department: string | null;
            salary: Prisma.Decimal;
            salaryType: import(".prisma/client").$Enums.SalaryType;
            startDate: Date;
            endDate: Date | null;
            photo: string | null;
            documents: Prisma.JsonValue | null;
            notes: string | null;
        }) | null;
    }>;
    create(dto: CreatePersonnelDto): Promise<{
        account: {
            id: string;
            email: string;
            passwordHash: string;
            mfaSecret: string | null;
            mfaEnabled: boolean;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
            failedAttempts: number;
            lockedUntil: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        personnel: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            accountId: string;
            dni: string;
            pin: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
            emergencyPhone: string | null;
            address: string | null;
            birthDate: Date | null;
            nationality: string;
            contractType: import(".prisma/client").$Enums.ContractType;
            position: string;
            department: string | null;
            salary: Prisma.Decimal;
            salaryType: import(".prisma/client").$Enums.SalaryType;
            startDate: Date;
            endDate: Date | null;
            photo: string | null;
            documents: Prisma.JsonValue | null;
            notes: string | null;
        };
    }>;
    update(id: string, dto: UpdatePersonnelDto): Promise<{
        account: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        accountId: string;
        dni: string;
        pin: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
        emergencyPhone: string | null;
        address: string | null;
        birthDate: Date | null;
        nationality: string;
        contractType: import(".prisma/client").$Enums.ContractType;
        position: string;
        department: string | null;
        salary: Prisma.Decimal;
        salaryType: import(".prisma/client").$Enums.SalaryType;
        startDate: Date;
        endDate: Date | null;
        photo: string | null;
        documents: Prisma.JsonValue | null;
        notes: string | null;
    }>;
    softDelete(id: string): Promise<{
        message: string;
    }>;
    getAttendance(personnelId: string, month?: number, year?: number): Promise<{
        records: {
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
        }[];
        counts: {
            PRESENT: number;
            ABSENT: number;
            LATE: number;
            HALF_DAY: number;
            PERMISSION: number;
            VACATION: number;
            SICK_LEAVE: number;
            HOLIDAY: number;
        };
        month: number;
        year: number;
    }>;
    checkIn(personnelId: string): Promise<{
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
    checkOut(personnelId: string): Promise<{
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
    getTodayAttendance(): Promise<{
        records: ({
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
        summary: {
            present: number;
            absent: number;
            late: number;
            total: number;
        };
    }>;
    authorizeVehicleUsage(dto: AuthorizeVehicleUsageDto, requestingUserId: string, requestingUserRole: UserRole): Promise<{
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
        vehicle: {
            id: string;
            status: import(".prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
            vin: string | null;
            engineType: import(".prisma/client").$Enums.EngineType;
            engineCC: number | null;
            mileage: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            clientId: string;
            photos: string[];
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.UsageStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        vehicleId: string;
        odometerIn: number | null;
        odometerOut: number | null;
        personnelId: string;
        authorizedBy: string | null;
        purpose: string;
        destination: string | null;
        expectedReturn: Date;
        checkoutAt: Date;
        returnAt: Date | null;
    }>;
    getActiveVehicleUsages(): Promise<({
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
        vehicle: {
            id: string;
            status: import(".prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
            vin: string | null;
            engineType: import(".prisma/client").$Enums.EngineType;
            engineCC: number | null;
            mileage: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            clientId: string;
            photos: string[];
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.UsageStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        vehicleId: string;
        odometerIn: number | null;
        odometerOut: number | null;
        personnelId: string;
        authorizedBy: string | null;
        purpose: string;
        destination: string | null;
        expectedReturn: Date;
        checkoutAt: Date;
        returnAt: Date | null;
    })[]>;
    returnVehicle(usageId: string, odometerIn: number): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.UsageStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        vehicleId: string;
        odometerIn: number | null;
        odometerOut: number | null;
        personnelId: string;
        authorizedBy: string | null;
        purpose: string;
        destination: string | null;
        expectedReturn: Date;
        checkoutAt: Date;
        returnAt: Date | null;
    }>;
    getPerformanceReport(personnelId: string): Promise<{
        personnelId: string;
        name: string;
        completedOrders: number;
        averageTimeMinutes: number;
        partsUsed: {
            name: string;
            count: number;
        }[];
    }>;
    updateRole(id: string, role: UserRole, performedBy: string): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    updateStatus(id: string, status: AccountStatus): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    checkInByUser(userId: string, notes?: string): Promise<{
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
    checkOutByUser(userId: string, notes?: string): Promise<{
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
    getOverdueVehicleUsages(): Promise<({
        personnel: {
            id: string;
            firstName: string;
            lastName: string;
        };
        vehicle: {
            id: string;
            status: import(".prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string | null;
            vin: string | null;
            engineType: import(".prisma/client").$Enums.EngineType;
            engineCC: number | null;
            mileage: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            clientId: string;
            photos: string[];
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.UsageStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        vehicleId: string;
        odometerIn: number | null;
        odometerOut: number | null;
        personnelId: string;
        authorizedBy: string | null;
        purpose: string;
        destination: string | null;
        expectedReturn: Date;
        checkoutAt: Date;
        returnAt: Date | null;
    })[]>;
    getAllSecurityList(requestingUserRole: UserRole): Promise<{
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
    }[]>;
}
