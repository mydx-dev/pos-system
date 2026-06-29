import { z } from 'zod';
import { passwordPepperKey } from '../shared/config';
import { testContainer } from './di.mock';
import {
    PasswordResetTable,
    RoleTable,
    UserTable,
} from './infrastructure/database/tables';

const passwordPepper = '00000000-0000-4000-a000-000000000000';
testContainer
    .resolve('properties')
    .setProperty(passwordPepperKey, passwordPepper);

type UserRecord = z.infer<typeof UserTable.schema>;

const adminUserId = testContainer.resolve('utilities').getUuid();
const adminHashedPassword = testContainer
    .resolve('passwordProtection')
    .execute('Adminpassword1', adminUserId);
const adminUser: UserRecord = {
    ID: adminUserId,
    氏名: '管理者',
    メールアドレス: 'admin@example.com',
    パスワード: adminHashedPassword,
    承認: true,
    バージョン: 1,
};

const users = [adminUser];

type PermissionRecord = z.infer<typeof RoleTable.schema>;
const adminPermission: PermissionRecord = {
    ユーザーID: adminUserId,
    名称: 'システム管理者',
};

const permissions = [adminPermission];
const dataStore = testContainer.resolve('dataStore');

dataStore.set(':ユーザー', [
    Object.keys(UserTable.schema.def.shape),
    ...users.map((user) => Object.values(user)),
]);
dataStore.set(':ロール', [
    Object.keys(RoleTable.schema.def.shape),
    ...permissions.map((permission) => Object.values(permission)),
]);
dataStore.set(':パスワードリセット', [
    Object.keys(PasswordResetTable.schema.def.shape),
]);

export { testContainer as container };
