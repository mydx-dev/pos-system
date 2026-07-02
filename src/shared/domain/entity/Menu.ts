import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';
import { MenuType } from './MenuCategory';

export const taxType = ['内税', '外税'] as const;
export type TaxType = (typeof taxType)[number];

export const productType = ['店販用', '業務用', '両用'] as const;
export type ProductType = (typeof productType)[number];

export class Menu extends SheetEntity {
    constructor(
        private _id: string,
        private _name: string,
        private _menuNumber: string,
        private _price: number,
        private _costPrice: number,
        private _taxType: TaxType,
        private _productType: ProductType,
        private _menuType: MenuType,
        private _categoryId: string,
        private _version: number
    ) {
        super();
    }

    get pkValue() {
        return this._id;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get menuNumber(): string {
        return this._menuNumber;
    }

    get price(): number {
        return this._price;
    }

    get costPrice(): number {
        return this._costPrice;
    }

    get taxType(): TaxType {
        return this._taxType;
    }

    get productType(): ProductType {
        return this._productType;
    }

    get menuType(): MenuType {
        return this._menuType;
    }

    get categoryId(): string {
        return this._categoryId;
    }

    get version(): number {
        return this._version;
    }

    isType(type: MenuType): boolean {
        return this._menuType === type;
    }
}
