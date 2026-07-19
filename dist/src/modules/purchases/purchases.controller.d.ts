import { PurchasesService } from "./purchases.service";
import { PurchaseFilterDto, CreatePurchaseDto, UpdatePurchaseStatusDto, ReceiveItemsDto } from "./dto/purchases.dto";
import { AuthUser } from "../auth/auth.service";
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
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
            tax: import("@prisma/client/runtime/library").Decimal;
            receivedAt: Date | null;
            createdBy: string;
            currency: string;
            approvedBy: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            shipping: import("@prisma/client/runtime/library").Decimal;
            customs: import("@prisma/client/runtime/library").Decimal;
            expectedAt: Date | null;
            commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
            commissionTo: string | null;
            commissionPaid: boolean;
            orderedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    })[]>;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    })[]>;
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
            amount: import("@prisma/client/runtime/library").Decimal;
            paidAt: Date | null;
            purchaseId: string | null;
            percentage: import("@prisma/client/runtime/library").Decimal | null;
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
            totalCost: import("@prisma/client/runtime/library").Decimal;
            itemId: string;
            quantity: number;
            unitCost: import("@prisma/client/runtime/library").Decimal;
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
            commissionRate: import("@prisma/client/runtime/library").Decimal | null;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    create(dto: CreatePurchaseDto, user: AuthUser): Promise<{
        items: ({
            item: {
                id: string;
                name: string;
                sku: string;
            };
        } & {
            id: string;
            notes: string | null;
            totalCost: import("@prisma/client/runtime/library").Decimal;
            itemId: string;
            quantity: number;
            unitCost: import("@prisma/client/runtime/library").Decimal;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdatePurchaseStatusDto, user: AuthUser): Promise<{
        items: {
            id: string;
            notes: string | null;
            totalCost: import("@prisma/client/runtime/library").Decimal;
            itemId: string;
            quantity: number;
            unitCost: import("@prisma/client/runtime/library").Decimal;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }>;
    receiveItems(id: string, dto: ReceiveItemsDto, user: AuthUser): Promise<({
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
            totalCost: import("@prisma/client/runtime/library").Decimal;
            itemId: string;
            quantity: number;
            unitCost: import("@prisma/client/runtime/library").Decimal;
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
        tax: import("@prisma/client/runtime/library").Decimal;
        receivedAt: Date | null;
        createdBy: string;
        currency: string;
        approvedBy: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        shipping: import("@prisma/client/runtime/library").Decimal;
        customs: import("@prisma/client/runtime/library").Decimal;
        expectedAt: Date | null;
        commissionAmount: import("@prisma/client/runtime/library").Decimal | null;
        commissionTo: string | null;
        commissionPaid: boolean;
        orderedAt: Date | null;
    }) | null>;
}
