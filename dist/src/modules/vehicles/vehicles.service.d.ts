import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto";
export declare class VehiclesService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(search?: string, limit?: number, cursor?: string): Promise<any>;
    findByPlate(plate: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: CreateVehicleDto): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string | null;
        vin: string | null;
        engineType: import("@prisma/client").$Enums.EngineType;
        engineCC: number | null;
        mileage: number | null;
        fuelType: import("@prisma/client").$Enums.FuelType;
        transmission: import("@prisma/client").$Enums.TransmissionType;
        clientId: string;
        photos: string[];
    }>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string | null;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string | null;
        vin: string | null;
        engineType: import("@prisma/client").$Enums.EngineType;
        engineCC: number | null;
        mileage: number | null;
        fuelType: import("@prisma/client").$Enums.FuelType;
        transmission: import("@prisma/client").$Enums.TransmissionType;
        clientId: string;
        photos: string[];
    }>;
    private invalidateVehicleCache;
    getWorkshopFleet(): Promise<({
        usageLogs: ({
            personnel: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.UsageStatus;
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
    } & {
        id: string;
        status: import("@prisma/client").$Enums.VehicleStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string | null;
        vin: string | null;
        engineType: import("@prisma/client").$Enums.EngineType;
        engineCC: number | null;
        mileage: number | null;
        fuelType: import("@prisma/client").$Enums.FuelType;
        transmission: import("@prisma/client").$Enums.TransmissionType;
        clientId: string;
        photos: string[];
    })[]>;
}
