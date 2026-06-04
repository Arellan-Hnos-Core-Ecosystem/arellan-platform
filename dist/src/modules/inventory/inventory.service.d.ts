import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto";
import { Prisma } from "@prisma/client";
export declare class InventoryService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(category?: string, lowStock?: boolean, limit?: number, cursor?: string): Promise<any>;
    private findAllLowStock;
    findOne(id: string): Promise<any>;
    create(dto: CreateItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        description: string | null;
        photos: string[];
        sku: string;
        categoryId: string | null;
        supplierId: string | null;
        unit: string;
        costPrice: Prisma.Decimal;
        unitPrice: Prisma.Decimal;
        stock: number;
        minStock: number;
        maxStock: number;
        location: string | null;
        barcode: string | null;
        isImported: boolean;
        customsCost: Prisma.Decimal | null;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        description: string | null;
        photos: string[];
        sku: string;
        categoryId: string | null;
        supplierId: string | null;
        unit: string;
        costPrice: Prisma.Decimal;
        unitPrice: Prisma.Decimal;
        stock: number;
        minStock: number;
        maxStock: number;
        location: string | null;
        barcode: string | null;
        isImported: boolean;
        customsCost: Prisma.Decimal | null;
        isActive: boolean;
    }>;
    addMovement(authorizedBy: string, itemId: string, dto: InventoryMovementDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        orderId: string | null;
        itemId: string;
        quantity: number;
        authorizedBy: string;
        justification: string | null;
        unitCost: Prisma.Decimal | null;
    }>;
    getMovements(itemId: string, limit?: number, cursor?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            orderId: string | null;
            itemId: string;
            quantity: number;
            authorizedBy: string;
            justification: string | null;
            unitCost: Prisma.Decimal | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    getAllMovements(itemId?: string, type?: string, limit?: number, cursor?: string): Promise<{
        data: ({
            item: {
                name: string;
                sku: string;
                unit: string;
            };
        } & {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            orderId: string | null;
            itemId: string;
            quantity: number;
            authorizedBy: string;
            justification: string | null;
            unitCost: Prisma.Decimal | null;
        })[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    getCriticalStock(): Promise<any>;
    getValuation(): Promise<any>;
    reserveForOrder(itemId: string, quantity: number, workOrderId: string, userId: string): Promise<{
        success: boolean;
        remainingStock: number;
    }>;
    private invalidateCatalogCache;
}
