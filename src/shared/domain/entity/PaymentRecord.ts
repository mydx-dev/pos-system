import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export const paymentRecordType = ['精算', '取消', '返金'] as const;
export type PaymentRecordType = (typeof paymentRecordType)[number];

export const paymentMethod = ['現金'] as const;
export type PaymentMethod = (typeof paymentMethod)[number];

export class PaymentRecord extends SheetEntity {
    constructor(
        private readonly _id: string,
        private readonly _treatmentId: string,
        private readonly _type: PaymentRecordType,
        private readonly _amount: number,
        private readonly _paymentMethod: PaymentMethod,
        private readonly _occurredAt: string,
        private readonly _note: string | null | undefined,
        private readonly _targetPaymentRecordId: string | null | undefined,
        private readonly _version: number
    ) {
        super();
    }

    get pkValue(): string {
        return this._id;
    }

    get id(): string {
        return this._id;
    }

    get treatmentId(): string {
        return this._treatmentId;
    }

    get type(): PaymentRecordType {
        return this._type;
    }

    get isPaid(): boolean {
        return this._type === '精算';
    }

    get isCancel(): boolean {
        return this._type === '取消';
    }

    get isRepayment(): boolean {
        return this._type === '返金';
    }

    get amount(): number {
        return this._amount;
    }

    get paymentMethod(): PaymentMethod {
        return this._paymentMethod;
    }

    get occurredAt(): string {
        return this._occurredAt;
    }

    get note(): string | null | undefined {
        return this._note;
    }

    get targetPaymentRecordId(): string | null | undefined {
        return this._targetPaymentRecordId;
    }

    get version(): number {
        return this._version;
    }
}
