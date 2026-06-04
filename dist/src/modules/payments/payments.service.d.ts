import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma, PaymentMethod } from "@prisma/client";
import { PaymentFilterDto, CreatePaymentDto } from "./dto/payments.dto";
export declare class PaymentsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filters: PaymentFilterDto): Promise<{
        data: ({
            workOrder: {
                number: string;
                id: string;
            } | null;
            invoice: {
                number: string;
                id: string;
                client: {
                    id: string;
                    firstName: string;
                    lastName: string | null;
                };
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            verifiedBy: string | null;
            amount: Prisma.Decimal;
            invoiceId: string | null;
            workOrderId: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            receivedBy: string;
            channel: import(".prisma/client").$Enums.PaymentChannel;
            isPersonalYape: boolean;
            yapeAccount: string | null;
            receiptUrl: string | null;
            paidAt: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(dto: CreatePaymentDto, userId: string): Promise<{
        workOrder: {
            number: string;
            id: string;
        } | null;
        invoice: {
            number: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        verifiedBy: string | null;
        amount: Prisma.Decimal;
        invoiceId: string | null;
        workOrderId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string;
        channel: import(".prisma/client").$Enums.PaymentChannel;
        isPersonalYape: boolean;
        yapeAccount: string | null;
        receiptUrl: string | null;
        paidAt: Date;
    }>;
    verify(id: string, verifierId: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        verifiedBy: string | null;
        amount: Prisma.Decimal;
        invoiceId: string | null;
        workOrderId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string;
        channel: import(".prisma/client").$Enums.PaymentChannel;
        isPersonalYape: boolean;
        yapeAccount: string | null;
        receiptUrl: string | null;
        paidAt: Date;
    }>;
    getByOrder(orderId: string): Promise<({
        invoice: {
            number: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        verifiedBy: string | null;
        amount: Prisma.Decimal;
        invoiceId: string | null;
        workOrderId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string;
        channel: import(".prisma/client").$Enums.PaymentChannel;
        isPersonalYape: boolean;
        yapeAccount: string | null;
        receiptUrl: string | null;
        paidAt: Date;
    })[]>;
    getByMethod(method: PaymentMethod, from: string, to: string): Promise<({
        workOrder: {
            number: string;
            id: string;
        } | null;
        invoice: {
            number: string;
            id: string;
            client: {
                id: string;
                firstName: string;
                lastName: string | null;
            };
        } | null;
    } & {
        id: string;
        createdAt: Date;
        notes: string | null;
        verifiedBy: string | null;
        amount: Prisma.Decimal;
        invoiceId: string | null;
        workOrderId: string | null;
        method: import(".prisma/client").$Enums.PaymentMethod;
        reference: string | null;
        receivedBy: string;
        channel: import(".prisma/client").$Enums.PaymentChannel;
        isPersonalYape: boolean;
        yapeAccount: string | null;
        receiptUrl: string | null;
        paidAt: Date;
    })[]>;
    getTodaySummary(): Promise<{
        date: string;
        totalPayments: number;
        grandTotal: number;
        byMethod: Record<string, {
            count: number;
            total: number;
        }>;
    }>;
    private updateInvoicePaymentStatus;
}
