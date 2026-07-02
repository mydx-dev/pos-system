import { InMemoryDataStore } from '@mydx-dev/gas-boost-runtime/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext } from '../../../../tests/helpers/createTestContext';
import {
    EmployeeTable,
    RoleTable,
    UserTable,
} from '../../infrastructure/database/tables';
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

describe('承認済みシステム管理者またはスタッフ判定', () => {
    let dataStore: InMemoryDataStore;
    let permissionCheck: PermissionCheck;
    const userTableHeader = Object.keys(UserTable.schema.def.shape);
    const permissionTableHeader = Object.keys(RoleTable.schema.def.shape);
    const employeeTableHeader = Object.keys(EmployeeTable.schema.def.shape);

    beforeEach(() => {
        const ctx = createTestContext();
        dataStore = ctx.dataStore;
        permissionCheck = ctx.permissionCheck;
    });

    it('承認済みのシステム管理者として登録されている場合は、trueを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id1', 'approved admin', 'admin@example.com', 'password', true, 1],
        ]);
        dataStore.set(':ロール', [
            permissionTableHeader,
            ['id1', 'システム管理者'],
        ]);

        const result = permissionCheck.isApprovedSystemAdminOrEmployee('id1');

        expect(result).toBe(true);
    });

    it('承認済みのスタッフとして登録されている場合は、trueを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id2', 'approved staff', 'staff@example.com', 'password', true, 1],
        ]);
        dataStore.set(':ロール', [permissionTableHeader, ['id2', 'ユーザー']]);
        dataStore.set(':スタッフ', [employeeTableHeader, ['id2']]);

        const result = permissionCheck.isApprovedSystemAdminOrEmployee('id2');

        expect(result).toBe(true);
    });

    it('未承認のスタッフとして登録されている場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            [
                'id3',
                'unapproved staff',
                'staff@example.com',
                'password',
                false,
                1,
            ],
        ]);
        dataStore.set(':ロール', [permissionTableHeader, ['id3', 'ユーザー']]);
        dataStore.set(':スタッフ', [employeeTableHeader, ['id3']]);

        const result = permissionCheck.isApprovedSystemAdminOrEmployee('id3');

        expect(result).toBe(false);
    });

    it('承認済みでもシステム管理者でもスタッフでもない場合は、falseを返す', () => {
        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id4', 'approved user', 'user@example.com', 'password', true, 1],
        ]);
        dataStore.set(':ロール', [permissionTableHeader, ['id4', 'ユーザー']]);

        const result = permissionCheck.isApprovedSystemAdminOrEmployee('id4');

        expect(result).toBe(false);
    });

    it('ユーザーが存在しない場合は、falseを返す', () => {
        const result =
            permissionCheck.isApprovedSystemAdminOrEmployee('unknown-id');

        expect(result).toBe(false);
    });
});

describe('承認済みユーザーのロール判定', () => {
    it('承認済みユーザーが指定されたロールを持っている場合は、trueを返す', () => {
        const ctx = createTestContext();
        const permissionCheck = ctx.permissionCheck;
        const dataStore = ctx.dataStore;

        const userTableHeader = Object.keys(UserTable.schema.def.shape);
        const permissionTableHeader = Object.keys(RoleTable.schema.def.shape);

        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id1', 'user1', 'user1@example.com', 'password', true, 1],
        ]);

        dataStore.set(':ロール', [
            permissionTableHeader,
            ['id1', 'システム管理者'],
        ]);
        const result = permissionCheck.hasRole('id1', 'システム管理者');
        expect(result.hasRole).toBe(true);
    });

    it('承認済みユーザーが指定されたロールを持っていない場合は、falseを返す', () => {
        const ctx = createTestContext();
        const permissionCheck = ctx.permissionCheck;
        const dataStore = ctx.dataStore;

        const userTableHeader = Object.keys(UserTable.schema.def.shape);
        const permissionTableHeader = Object.keys(RoleTable.schema.def.shape);

        dataStore.set(':ユーザー', [
            userTableHeader,
            ['id1', 'user1', 'user1@example.com', 'password', true, 1],
        ]);

        dataStore.set(':ロール', [permissionTableHeader, ['id1', '開発者']]);
        const result = permissionCheck.hasRole('id1', 'システム管理者');
        expect(result.hasRole).toBe(false);
    });
});
