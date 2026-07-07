import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export class TreatmentMenu extends SheetEntity {
    constructor(
        private readonly _id: string,
        private readonly _treatmentId: string,
        private readonly _menuId: string,
        private readonly _menuName: string,
        private readonly _regularPrice: number,
        private readonly _quantity: number,
        private readonly _discountAmount: number,
        private readonly _displayOrder: number,
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

    get menuId(): string {
        return this._menuId;
    }

    get menuName(): string {
        return this._menuName;
    }

    get regularPrice(): number {
        return this._regularPrice;
    }

    get quantity(): number {
        return this._quantity;
    }

    get discountAmount(): number {
        return this._discountAmount;
    }

    get displayOrder(): number {
        return this._displayOrder;
    }

    get version(): number {
        return this._version;
    }
}
