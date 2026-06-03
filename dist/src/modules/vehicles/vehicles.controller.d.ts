import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto";
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findByPlate(plate: string): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
        clientId: string;
    }>;
    findAll(search?: string, limit?: string, cursor?: string): Promise<{
        data: ({
            client: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        })[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    findOne(id: string): Promise<{
        workOrders: {
            number: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            description: string;
            totalCost: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        client: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
        clientId: string;
    }>;
    create(dto: CreateVehicleDto): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
        clientId: string;
    }>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        client: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        plate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
        clientId: string;
    }>;
}
