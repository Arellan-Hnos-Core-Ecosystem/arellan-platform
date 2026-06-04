import { InventoryService } from "./inventory.service";
import { CreateItemDto, UpdateItemDto, InventoryMovementDto } from "./dto/inventory.dto";
import { AuthUser } from "../auth/auth.service";
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getAllMovements(itemId?: string, type?: string, limit?: string, cursor?: string): Promise<{
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
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    getCriticalStock(): Promise<any>;
    getLowStock(): Promise<any>;
    getValuation(): Promise<any>;
    findAll(category?: string, lowStock?: string, limit?: string, cursor?: string): Promise<any>;
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
        costPrice: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        minStock: number;
        maxStock: number;
        location: string | null;
        barcode: string | null;
        isImported: boolean;
        customsCost: import("@prisma/client/runtime/library").Decimal | null;
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
        costPrice: import("@prisma/client/runtime/library").Decimal;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        stock: number;
        minStock: number;
        maxStock: number;
        location: string | null;
        barcode: string | null;
        isImported: boolean;
        customsCost: import("@prisma/client/runtime/library").Decimal | null;
        isActive: boolean;
    }>;
    addMovement(user: AuthUser, id: string, dto: InventoryMovementDto): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.MovementType;
        orderId: string | null;
        itemId: string;
        quantity: number;
        authorizedBy: string;
        justification: string | null;
        unitCost: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getMovements(id: string, limit?: string, cursor?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            type: import(".prisma/client").$Enums.MovementType;
            orderId: string | null;
            itemId: string;
            quantity: number;
            authorizedBy: string;
            justification: string | null;
            unitCost: import("@prisma/client/runtime/library").Decimal | null;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    reserveForOrder(itemId: string, body: {
        quantity: number;
        workOrderId: string;
    }, user: AuthUser): Promise<{
        success: boolean;
        remainingStock: number;
    }>;
}
