import { InventoryService } from "./inventory.service";
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto";
import { AuthUser } from "../auth/auth.service";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getCriticalStock(): Promise<{
        id: string;
        sku: string;
        name: string;
        category: string;
        stock: number;
        minStock: number;
        unitPrice: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAll(category?: string, lowStock?: string, limit?: string, cursor?: string): Promise<{
        data: {
            unitPrice: string;
            id: string;
            sku: string;
            name: string;
            category: string;
            stock: number;
            minStock: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    } | {
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            sku: string;
            category: string;
            stock: number;
            minStock: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        stock: number;
        minStock: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    create(dto: CreateItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        stock: number;
        minStock: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdateItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        stock: number;
        minStock: number;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    addMovement(user: AuthUser, id: string, dto: InventoryMovementDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        orderId: string | null;
        quantity: number;
        justification: string | null;
        itemId: string;
        authorizedBy: string;
        unitCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getMovements(id: string, limit?: string, cursor?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            orderId: string | null;
            quantity: number;
            justification: string | null;
            itemId: string;
            authorizedBy: string;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
}
