import { SheetEntity } from '@mydx-dev/gas-boost-runtime/core';
import { Role } from './Role';

export class User extends SheetEntity {
    constructor(
        private _id: string,
        private _name: string,
        private _email: string,
        private _password: string,
        private _approval: boolean,
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

    get email(): string {
        return this._email;
    }

    get password(): string {
        return this._password;
    }

    get role(): string[] {
        const roles = this.getRelation(Role);
        return roles.map((role) => role.name);
    }

    get approval(): boolean {
        return this._approval;
    }

    get version(): number {
        return this._version;
    }

    public hasRole(roleName: string): boolean {
        return this.role.includes(roleName);
    }

    isAdmin(): boolean {
        return this.role.includes('システム管理者');
    }

    serializeEmptyPassword() {
        return {
            ID: this.id,
            氏名: this.name,
            メールアドレス: this.email,
            パスワード: '',
            承認: this.approval,
            バージョン: this.version,
        };
    }

    verifyPassword(password: string): boolean {
        return this.password === password;
    }

    approve() {
        this._approval = true;
    }

    unapprove() {
        this._approval = false;
    }

    resetPassword(newPassword: string) {
        this._password = newPassword;
    }

    isDeveloper(): boolean {
        return this.role.includes('開発者');
    }
}
