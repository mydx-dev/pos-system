import { InMemoryDataStore } from '@mydx-dev/gas-boost-runtime/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../../../../tests/helpers/createTestContext';
import { RoleTable, UserTable } from '../../infrastructure/database/tables';
import { PermissionCheck } from './PermissionCheck';

describe('承認済み開発者判定', () => {
    let dataStore: InMemoryDataStore;
    let permissionCheck: PermissionCheck;
    const userTableHeader = Object.keys(UserTable.schema.def.shape);
    const permissionTableHeader = Object.keys(RoleTable.schema.def.shape);

    beforeEach(() => {
        const ctx = createTestContext();
        dataStore = ctx.dataStore;
        permissionCheck = ctx.permissionCheck;
    });

    it('承認済みの開発者として登録されている場合は、trueを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id1',
                'approved developer',
                'developer@example.com',
                'password',
                true,
                1,
            ],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id1', '開発者']]);
        const result = permissionCheck.isApprovedDeveloper('id1');
        expect(result).toBe(true);
    });

    it('未承認の開発者として登録されている場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id1',
                'unapproved developer',
                'developer@example.com',
                'password',
                false,
                1,
            ],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id1', '開発者']]);
        const result = permissionCheck.isApprovedDeveloper('id1');
        expect(result).toBe(false);
    });

    it('開発者として登録されていない場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id1', 'administrator', 'admin@example.com', 'password', true, 1],
        ]);

        dataStore.set(':ロール', [
            permissionTableHeader,
            ['id1', 'システム管理者'],
        ]);
        const result = permissionCheck.isApprovedDeveloper('id1');
        expect(result).toBe(false);
    });
});

describe('承認済み開発者またはシステム管理者判定', () => {
    let dataStore: InMemoryDataStore;
    let permissionCheck: PermissionCheck;
    const userTableHeader = Object.keys(UserTable.schema.def.shape);
    const permissionTableHeader = Object.keys(RoleTable.schema.def.shape);

    beforeEach(() => {
        const ctx = createTestContext();
        dataStore = ctx.dataStore;
        permissionCheck = ctx.permissionCheck;
    });

    it('承認済みの開発者として登録されている場合は、trueを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id1',
                'approved developer',
                'developer@example.com',
                'password',
                true,
                1,
            ],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id1', '開発者']]);
        const result = permissionCheck.isApprovedDeveloperOrSystemAdmin('id1');
        expect(result).toBe(true);
    });

    it('未承認の開発者として登録されている場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id1',
                'unapproved developer',
                'developer@example.com',
                'password',
                false,
                1,
            ],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id1', '開発者']]);
        const result = permissionCheck.isApprovedDeveloperOrSystemAdmin('id1');
        expect(result).toBe(false);
    });

    it('承認済みのシステム管理者として登録されている場合は、trueを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id2', 'approved admin', 'admin@example.com', 'password', true, 1],
        ]);

        dataStore.set(':ロール', [
            permissionTableHeader,
            ['id2', 'システム管理者'],
        ]);
        const result = permissionCheck.isApprovedDeveloperOrSystemAdmin('id2');
        expect(result).toBe(true);
    });

    it('未承認のシステム管理者として登録されている場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id3',
                'unapproved admin',
                'admin@example.com',
                'password',
                false,
                1,
            ],
        ]);

        dataStore.set(':ロール', [
            permissionTableHeader,
            ['id3', 'システム管理者'],
        ]);
        const result = permissionCheck.isApprovedDeveloperOrSystemAdmin('id3');
        expect(result).toBe(false);
    });

    it('開発者またはシステム管理者として登録されていない場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id4', 'user', 'user@example.com', 'password', true, 1],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id4', 'ユーザー']]);
        const result = permissionCheck.isApprovedDeveloperOrSystemAdmin('id4');
        expect(result).toBe(false);
    });
});
