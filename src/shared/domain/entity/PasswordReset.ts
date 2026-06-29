import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export class PasswordReset extends SheetEntity {
    constructor(
        private _userId: string,
        private _token: string,
        private _expiresAt: number
    ) {
        super();
    }

    get userId(): string {
        return this._userId;
    }

    get token(): string {
        return this._token;
    }

    get expiresAt(): number {
        return this._expiresAt;
    }

    get pkValue(): string {
        return this._token;
    }

    isValid(now: number): boolean {
        return now <= this._expiresAt;
    }
}
