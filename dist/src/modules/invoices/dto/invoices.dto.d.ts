import { InvoiceStatus, InvoiceType } from "@prisma/client";
export declare class InvoiceFilterDto {
    status?: InvoiceStatus;
    clientId?: string;
    search?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
}
export declare class CreateInvoiceDto {
    clientId: string;
    workOrderId?: string;
    type?: InvoiceType;
    notes?: string;
    dueDate?: string;
    includeTax?: boolean;
}
export declare class CancelInvoiceDto {
    reason: string;
}
export declare class IssueInvoiceDto {
    notes?: string;
}
