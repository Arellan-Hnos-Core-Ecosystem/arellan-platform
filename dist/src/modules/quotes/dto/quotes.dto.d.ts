import { QuoteStatus } from "@prisma/client";
export declare class QuoteFilterDto {
    status?: QuoteStatus;
    clientId?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
export declare class CreateQuoteDto {
    clientId: string;
    workOrderId?: string;
    validUntil: string;
    notes?: string;
}
export declare class RejectQuoteDto {
    reason: string;
}
