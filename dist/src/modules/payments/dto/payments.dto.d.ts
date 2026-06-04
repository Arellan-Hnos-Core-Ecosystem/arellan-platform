import { PaymentMethod, PaymentChannel } from "@prisma/client";
export declare class PaymentFilterDto {
    method?: PaymentMethod;
    orderId?: string;
    invoiceId?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class CreatePaymentDto {
    invoiceId?: string;
    workOrderId?: string;
    method: PaymentMethod;
    amount: number;
    reference?: string;
    channel?: PaymentChannel;
    isPersonalYape?: boolean;
    yapeAccount?: string;
    notes?: string;
    receiptUrl?: string;
    paidAt?: string;
}
export declare class VerifyPaymentDto {
    verifierId: string;
}
