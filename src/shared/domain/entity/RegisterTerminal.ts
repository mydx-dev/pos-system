import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';

export class RegisterTerminal extends SheetEntity {
    constructor(
        private _id: string,
        private _name: string,
        private _tokenHash: string,
        private _enabled: boolean,
        private _issuedAt: string,
        private _lastUsedAt: string | null | undefined,
        private _createdBy: string,
        private _updatedBy: string | null | undefined,
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

    get tokenHash(): string {
        return this._tokenHash;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    get issuedAt(): string {
        return this._issuedAt;
    }

    get lastUsedAt(): string | null | undefined {
        return this._lastUsedAt;
    }

    get createdBy(): string {
        return this._createdBy;
    }

    get updatedBy(): string | null | undefined {
        return this._updatedBy;
    }

    get version(): number {
        return this._version;
    }

    refreshToken(tokenHash: string, issuedAt: string, updatedBy: string): void {
        this._tokenHash = tokenHash;
        this._issuedAt = issuedAt;
        this._updatedBy = updatedBy;
    }

    use(usedAt: string): void {
        this._lastUsedAt = usedAt;
    }
}
