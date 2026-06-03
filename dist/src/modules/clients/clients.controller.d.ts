import { ClientsService } from "./clients.service";
import { CreateClientDto, UpdateClientDto } from "./dto/clients.dto";
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    findAll(search?: string, limit?: string, cursor?: string): Promise<{
        data: {
            id: string;
            email: string | null;
            createdAt: Date;
            updatedAt: Date;
            dni: string | null;
            firstName: string;
            lastName: string;
            phone: string | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    findOne(id: string): Promise<{
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            plate: string;
            brand: string;
            model: string;
            year: number;
            color: string;
            clientId: string;
        }[];
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        dni: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    create(dto: CreateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        dni: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        dni: string | null;
        firstName: string;
        lastName: string;
        phone: string | null;
    }>;
    getHistory(id: string): Promise<({
        vehicle: {
            plate: string;
            brand: string;
            model: string;
        };
        mechanic: {
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        vehicleId: string;
        mechanicId: string;
        description: string;
        diagnosis: string | null;
        laborCost: import("@prisma/client/runtime/library").Decimal | null;
        partsCost: import("@prisma/client/runtime/library").Decimal | null;
        estimatedDelivery: Date | null;
        totalCost: import("@prisma/client/runtime/library").Decimal | null;
        receivedAt: Date;
        deliveredAt: Date | null;
    })[]>;
}
