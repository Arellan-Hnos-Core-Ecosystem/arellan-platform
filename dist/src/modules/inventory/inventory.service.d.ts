import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto";
import { Prisma } from "@prisma/client";
export declare class InventoryService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(category?: string, lowStock?: boolean, limit?: number, cursor?: string): Promise<{
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
            unitPrice: Prisma.Decimal;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    private findAllLowStock;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        sku: string;
        category: string;
        stock: number;
        minStock: number;
        unitPrice: Prisma.Decimal;
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
        unitPrice: Prisma.Decimal;
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
        unitPrice: Prisma.Decimal;
    }>;
    addMovement(authorizedBy: string, itemId: string, dto: InventoryMovementDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        orderId: string | null;
        quantity: number;
        justification: string | null;
        itemId: string;
        authorizedBy: string;
        unitCost: Prisma.Decimal | null;
    }>;
    getMovements(itemId: string, limit?: number, cursor?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            orderId: string | null;
            quantity: number;
            justification: string | null;
            itemId: string;
            authorizedBy: string;
            unitCost: Prisma.Decimal | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
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
}
