import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';
import { User } from './User';

export class Employee extends SheetEntity {
    constructor(private readonly _userId: string) {
        super();
    }

    get pkValue(): string {
        return this._userId;
    }

    get userId(): string {
        return this._userId;
    }

    get user(): User | null {
        return this.getRelation(User)[0] ?? null;
    }
}
