import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateVehicleDto, UpdateVehicleDto } from "./dto/vehicles.dto";
export declare class VehiclesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(search?: string, limit?: number, cursor?: string): Promise<{
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
