import { FinanceService } from "./finance.service";
export declare class PaymentWebhookController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    confirmPayment(body: {
        qrToken: string;
        paymentMethod?: string;
        reference?: string;
    }): Promise<{
        status: string;
        payment?: undefined;
    } | {
        status: string;
        payment: {
            id: string;
            createdAt: Date;
            notes: string | null;
            verifiedBy: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            workOrderId: string | null;
            invoiceId: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            reference: string | null;
            receivedBy: string;
            channel: import(".prisma/client").$Enums.PaymentChannel;
            isPersonalYape: boolean;
            yapeAccount: string | null;
            receiptUrl: string | null;
            paidAt: Date;
        };
    }>;
}
