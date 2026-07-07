import {
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { expect, it } from 'vitest';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { SystemAdmins } from './SystemAdmins';

function factory() {
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    const systemAdmins = new SystemAdmins(db);
    return { systemAdmins, dataStore };
}

it('承認済みのシステム管理者のみを取得する', () => {
    const { systemAdmins, dataStore } = factory();
    dataStore.set(':ユーザー', [
        ['ID', '氏名', 'メールアドレス', 'パスワード', '承認', 'バージョン'],
        ['1', 'Admin User', 'admin@example.com', 'hashed-password', true, 1],
        ['2', 'Regular User', 'user@example.com', 'hashed-password', true, 1],
        [
            '3',
            'Another Admin',
            'another-admin@example.com',
            'hashed-password',
            false,
            1,
        ],
    ]);

    dataStore.set(':ロール', [
        ['ユーザーID', '名称'],
        ['1', 'システム管理者'],
        ['2', 'ユーザー'],
        ['3', 'システム管理者'],
    ]);

    const adminUser = new User(
        '1',
        'Admin User',
        'admin@example.com',
        'hashed-password',
        true,
        1
    );
    adminUser.addRelation(Role, new Role(adminUser.id, 'システム管理者'));

    const admins = systemAdmins.search();
    expect(admins).toEqual([adminUser]);
});
