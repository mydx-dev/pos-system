import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';
import { PaymentRecord, PaymentRecordType } from './PaymentRecord';
import { TreatmentMenu } from './TreatmentMenu';

export const treatmentStatus = ['予約済み', '来店済み', '精算済み'] as const;
export type TreatmentStatus = (typeof treatmentStatus)[number];

export class Treatment extends SheetEntity {
    constructor(
        private readonly _id: string,
        private readonly _customerId: string,
        private readonly _staffId: string,
        private readonly _status: TreatmentStatus,
        private readonly _startAt: string,
        private readonly _duration: number,
        private readonly _note: string | null | undefined,
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

    get customerId(): string {
        return this._customerId;
    }

    get staffId(): string {
        return this._staffId;
    }

    get status(): TreatmentStatus {
        return this._status;
    }

    get isDone(): boolean {
        return this._status === '精算済み';
    }

    get startAt(): string {
        return this._startAt;
    }

    get duration(): number {
        return this._duration;
    }

    get note(): string | null | undefined {
        return this._note;
    }

    get version(): number {
        return this._version;
    }

    get paymentRecords(): PaymentRecord[] {
        return this.getRelation(PaymentRecord);
    }

    get treatmentMenus(): TreatmentMenu[] {
        return this.getRelation(TreatmentMenu);
    }

    hasMenu(treatmentMenuId: string): boolean {
        return this.treatmentMenus.some(
            (treatmentMenu) => treatmentMenu.id === treatmentMenuId
        );
    }

    get paidTotal(): number {
        return this.paymentRecords
            .filter((record) => record.isPaid)
            .reduce((total, record) => total + record.amount, 0);
    }

    get cancelTotal(): number {
        return this.paymentRecords
            .filter((record) => record.isCancel)
            .reduce((total, record) => total + record.amount, 0);
    }

    get repaymentTotal(): number {
        return this.paymentRecords
            .filter((record) => record.isRepayment)
            .reduce((total, record) => total + record.amount, 0);
    }

    get currentSales(): number {
        return this.paidTotal - this.cancelTotal - this.repaymentTotal;
    }

    get hasPaidPaymentRecord(): boolean {
        return this.paymentRecords.some((record) => record.isPaid);
    }

    get canCancelPayment(): boolean {
        return this.hasPaidPaymentRecord;
    }

    get cancelAmount(): number {
        return this.currentSales;
    }

    canRepay(amount: number): boolean {
        return amount > 0 && this.hasPaidPaymentRecord;
    }

    canPay(amount: number): boolean {
        return amount > 0;
    }

    canUseTargetPaymentRecord(
        targetPaymentRecordId: string | null | undefined
    ): boolean {
        if (!targetPaymentRecordId) {
            return true;
        }

        return this.paymentRecords.some(
            (record) => record.id === targetPaymentRecordId && record.isPaid
        );
    }

    canCreatePaymentRecord(
        type: PaymentRecordType,
        amount: number,
        targetPaymentRecordId?: string | null
    ): boolean {
        if (type === '精算') {
            return this.canPay(amount);
        }

        if (!this.canUseTargetPaymentRecord(targetPaymentRecordId)) {
            return false;
        }

        if (type === '取消') {
            return amount > 0 && this.canCancelPayment;
        }

        if (type === '返金') {
            return this.canRepay(amount);
        }

        return false;
    }
}
