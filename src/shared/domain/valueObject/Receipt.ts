import { PaymentMethod } from '../entity/PaymentRecord';

export type ReceiptStore = {
    name: string;
    postalCode?: string | null;
    address?: string | null;
    phoneNumber?: string | null;
    message?: string | null;
};

export type ReceiptLineItem = {
    name: string;
    quantity: number;
    regularPrice: number;
    discountAmount: number;
    subtotal: number;
};

export type ReceiptData = {
    receiptNo: string;
    paymentRecordId: string;
    treatmentId: string;
    issuedAt: string;
    paidAt: string;
    paymentMethod: PaymentMethod;
    customerName?: string | null;
    staffName?: string | null;
    registerTerminalId?: string | null;
    store: ReceiptStore;
    items: ReceiptLineItem[];
    subtotal: number;
    discountTotal: number;
    total: number;
    paidAmount: number;
};
