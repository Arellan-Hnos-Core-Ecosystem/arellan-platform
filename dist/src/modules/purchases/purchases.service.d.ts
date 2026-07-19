import { PrismaService } from "../../common/prisma/prisma.service";
import { RedisService } from "../../common/redis/redis.service";
import { Prisma, PurchaseStatus } from "@prisma/client";
import { PurchaseFilterDto, CreatePurchaseDto, ReceiveItemsDto } from "./dto/purchases.dto";
export declare class PurchasesService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(filters: PurchaseFilterDto): Promise<{
        data: ({
            supplier: {
                id: string;
                name: string;
                phone: string | null;
                contactName: string | null;
            };
            _count: {
                items: number;
            };
        } & {
            number: string;
            id: string;
            status: import("@prisma/client").$Enums.PurchaseStatus;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            supplierId: string;
            isImported: boolean;
            tax: Prisma.Decimal;
            receivedAt: Date | null;
            createdBy: string;
            currency: string;
            approvedBy: string | null;
            subtotal: Prisma.Decimal;
            total: Prisma.Decimal;
            shipping: Prisma.Decimal;
            customs: Prisma.Decimal;
            expectedAt: Date | null;
            commissionAmount: Prisma.Decimal | null;
            commissionTo: string | null;
            commissionPaid: boolean;
            orderedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        commissions: ({
            personnel: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            status: import("@prisma/client").$Enums.ApprovalStatus;
            createdAt: Date;
            notes: string | null;
            type: string;
            supplierId: string | null;
            personnelId: string;
            amount: Prisma.Decimal;
            paidAt: Date | null;
            purchaseId: string | null;
            percentage: Prisma.Decimal | null;
        })[];
        items: ({
            item: {
                id: string;
                name: string;
                sku: string;
                stock: number;
            };
        } & {
            id: string;
            notes: string | null;
            totalCost: Prisma.Decimal;
            itemId: string;
            quantity: number;
            unitCost: Prisma.Decimal;
            purchaseId: string;
            receivedQty: number;
        })[];
        supplier: {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            phone: string | null;
            address: string | null;
            notes: string | null;
            ruc: string | null;
            contactName: string | null;
            website: string | null;
            paymentTerms: string | null;
            isImporter: boolean;
            commissionRate: Prisma.Decimal | null;
        };
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    create(dto: CreatePurchaseDto, userId: string): Promise<{
        items: ({
            item: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            notes: string | null;
            totalCost: Prisma.Decimal;
            itemId: string;
            quantity: number;
            unitCost: Prisma.Decimal;
            purchaseId: string;
            receivedQty: number;
        })[];
        supplier: {
            id: string;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    updateStatus(id: string, status: PurchaseStatus, _userId: string): Promise<{
        items: {
            id: string;
            notes: string | null;
            totalCost: Prisma.Decimal;
            itemId: string;
            quantity: number;
            unitCost: Prisma.Decimal;
            purchaseId: string;
            receivedQty: number;
        }[];
        supplier: {
            id: string;
            name: string;
        };
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    receiveItems(id: string, dto: ReceiveItemsDto, userId: string): Promise<({
        items: ({
            item: {
                id: string;
                name: string;
                sku: string;
                stock: number;
            };
        } & {
            id: string;
            notes: string | null;
            totalCost: Prisma.Decimal;
            itemId: string;
            quantity: number;
            unitCost: Prisma.Decimal;
            purchaseId: string;
            receivedQty: number;
        })[];
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }) | null>;
    getBySupplier(supplierId: string): Promise<({
        _count: {
            items: number;
        };
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    })[]>;
    getImports(): Promise<({
        supplier: {
            id: string;
            name: string;
        };
        _count: {
            items: number;
        };
    } & {
        number: string;
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        supplierId: string;
        isImported: boolean;
        tax: Prisma.Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: Prisma.Decimal;
        total: Prisma.Decimal;
        shipping: Prisma.Decimal;
        customs: Prisma.Decimal;
        expectedAt: Date | null;
        commissionAmount: Prisma.Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    })[]>;
}
