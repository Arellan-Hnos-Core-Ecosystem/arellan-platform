import { PersonnelService } from "./personnel.service";
import { AuthUser } from "../auth/auth.service";
import { PersonnelFilterDto, UpdateRoleDto, UpdateAccountStatusDto, CheckInOutDto, AuthorizeVehicleUsageDto } from "./dto/personnel.dto";
export declare class PersonnelController {
    private readonly personnelService;
    constructor(personnelService: PersonnelService);
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
                checkoutAt: Date;
                expectedReturn: Date;
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
            salary: import("@prisma/client/runtime/library").Decimal;
            salaryType: import(".prisma/client").$Enums.SalaryType;
            startDate: Date;
            endDate: Date | null;
            photo: string | null;
            documents: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
        }) | null;
    }>;
    updateRole(id: string, dto: UpdateRoleDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    updateStatus(id: string, dto: UpdateAccountStatusDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    checkIn(user: AuthUser, dto: CheckInOutDto): Promise<{
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
    checkOut(user: AuthUser, dto: CheckInOutDto): Promise<{
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
    getAttendanceToday(): Promise<{
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
    authorizeVehicleUsage(dto: AuthorizeVehicleUsageDto, user: AuthUser): Promise<{
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
        checkoutAt: Date;
        expectedReturn: Date;
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
        checkoutAt: Date;
        expectedReturn: Date;
        returnAt: Date | null;
    })[]>;
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
        checkoutAt: Date;
        expectedReturn: Date;
        returnAt: Date | null;
    })[]>;
}
