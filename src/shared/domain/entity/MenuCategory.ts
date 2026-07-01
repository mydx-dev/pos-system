import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export const menuType = ['技術', '商品'];
export type MenuType = (typeof menuType)[number];

export class MenuCategory extends SheetEntity {
    constructor(
        private _id: string,
        private _name: string,
        private _menuType: MenuType,
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

    get menuType(): MenuType {
        return this._menuType;
    }

    get version(): number {
        return this._version;
    }

    isType(type: MenuType): boolean {
        return this._menuType === type;
    }
}
