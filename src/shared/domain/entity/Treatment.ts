import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

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
}
