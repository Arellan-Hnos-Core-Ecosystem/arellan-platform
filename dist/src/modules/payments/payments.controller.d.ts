import { PaymentsService } from "./payments.service";
import { PaymentFilterDto, CreatePaymentDto, VerifyPaymentDto } from "./dto/payments.dto";
import { AuthUser } from "../auth/auth.service";
import { PaymentMethod } from "@prisma/client";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
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
            amount: import("@prisma/client/runtime/library").Decimal;
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
    getTodaySummary(): Promise<{
        date: string;
        totalPayments: number;
        grandTotal: number;
        byMethod: Record<string, {
            count: number;
            total: number;
        }>;
    }>;
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    create(dto: CreatePaymentDto, user: AuthUser): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
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
    verify(id: string, dto: VerifyPaymentDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        verifiedBy: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
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
}
