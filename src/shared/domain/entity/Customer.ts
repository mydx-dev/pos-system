import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';
import { Employee } from './Employee';

export class Customer extends SheetEntity {
    constructor(
        private readonly _id: string,
        private readonly _name: string,
        private readonly _primaryStaffId: string | null | undefined,
        private readonly _isStaffFixed: boolean,
        private readonly _email: string | null | undefined,
        private readonly _phoneNumber: string | null | undefined,
        private readonly _birthDate: string | null | undefined,
        private readonly _postalCode: string | null | undefined,
        private readonly _address: string | null | undefined,
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

    get name(): string {
        return this._name;
    }

    get primaryStaffId(): string | null | undefined {
        return this._primaryStaffId;
    }

    get isStaffFixed(): boolean {
        return this._isStaffFixed;
    }

    get email(): string | null | undefined {
        return this._email;
    }

    get phoneNumber(): string | null | undefined {
        return this._phoneNumber;
    }

    get birthDate(): string | null | undefined {
        return this._birthDate;
    }

    get postalCode(): string | null | undefined {
        return this._postalCode;
    }

    get address(): string | null | undefined {
        return this._address;
    }

    get note(): string | null | undefined {
        return this._note;
    }

    get version(): number {
        return this._version;
    }

    get primaryStaff(): Employee | null {
        return this.getRelation(Employee)[0] ?? null;
    }
}
