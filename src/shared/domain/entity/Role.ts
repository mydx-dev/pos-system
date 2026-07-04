import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export const roleName = ['システム管理者', 'ユーザー'] as const;
export type RoleName = (typeof roleName)[number];

export class Role extends SheetEntity {
    constructor(
        private _userId: string,
        private _name: RoleName
    ) {
        super();
    }

    get pkValue() {
        return this._userId;
    }

    get userId(): string {
        return this._userId;
    }

    get name(): RoleName {
        return this._name;
    }
}
