import { z } from 'zod';
import { passwordPepperKey } from '../shared/config';
import { testContainer } from './di.mock';
import {
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
    PasswordResetTable,
    RegisterTerminalTable,
    RoleTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from './infrastructure/database/tables';

const passwordPepper = '00000000-0000-4000-a000-000000000000';
testContainer
    .resolve('properties')
    .setProperty(passwordPepperKey, passwordPepper);

type UserRecord = z.infer<typeof UserTable.schema>;
const utilities = testContainer.resolve('utilities');
const passwordProtection = testContainer.resolve('passwordProtection');

const adminUserId = utilities.getUuid();
const adminHashedPassword = passwordProtection.execute(
    'Adminpassword1',
    adminUserId
);
const adminUser: UserRecord = {
    ID: adminUserId,
    氏名: '管理者',
    メールアドレス: 'admin@example.com',
    パスワード: adminHashedPassword,
    承認: true,
    バージョン: 1,
};
const staffUser: UserRecord = {
    ID: utilities.getUuid(),
    氏名: 'スタッフ',
    メールアドレス: 'staff@example.com',
    パスワード: '',
    承認: true,
    バージョン: 1,
};
staffUser.パスワード = passwordProtection.execute(
    'Staffpassword1',
    staffUser.ID
);

const users = [adminUser, staffUser];

type PermissionRecord = z.infer<typeof RoleTable.schema>;
const adminPermission: PermissionRecord = {
    ユーザーID: adminUserId,
    名称: 'システム管理者',
};

const permissions = [adminPermission];
const dataStore = testContainer.resolve('dataStore');

const employee1: z.infer<typeof EmployeeTable.schema> = {
    ユーザーID: adminUserId,
};

const employee2: z.infer<typeof EmployeeTable.schema> = {
    ユーザーID: staffUser.ID,
};

const employees = [employee1, employee2];

const customer1: z.infer<typeof CustomerTable.schema> = {
    ID: utilities.getUuid(),
    氏名: '顧客1',
    メールアドレス: 'customer1@example.com',
    担当固定: true,
    主担当スタッフID: staffUser.ID,
    バージョン: 1,
};

const customer2: z.infer<typeof CustomerTable.schema> = {
    ID: utilities.getUuid(),
    氏名: '顧客2',
    メールアドレス: 'customer2@example.com',
    担当固定: true,
    主担当スタッフID: staffUser.ID,
    バージョン: 1,
};

const category1: z.infer<typeof MenuCategoryTable.schema> = {
    ID: utilities.getUuid(),
    名称: '技術メニュー１',
    バージョン: 1,
    種別: '技術',
};

const category2: z.infer<typeof MenuCategoryTable.schema> = {
    ID: utilities.getUuid(),
    名称: '物販メニュー１',
    バージョン: 1,
    種別: '物販',
};

const menu1: z.infer<typeof MenuTable.schema> = {
    ID: utilities.getUuid(),
    名称: 'メニュー1',
    価格: 1000,
    バージョン: 1,
    メニュー番号: '001',
    仕入れ単価: 500,
    税区分: '内税',
    商品区分: '両用',
    種別: '技術',
    カテゴリーID: category1.ID,
};

const menu2: z.infer<typeof MenuTable.schema> = {
    ID: utilities.getUuid(),
    名称: 'メニュー2',
    価格: 2000,
    バージョン: 1,
    メニュー番号: '002',
    仕入れ単価: 1000,
    税区分: '内税',
    商品区分: '両用',
    種別: '技術',
    カテゴリーID: category2.ID,
};

const menus = [menu1, menu2];

const treatment1: z.infer<typeof TreatmentTable.schema> = {
    ID: utilities.getUuid(),
    顧客ID: customer1.ID,
    担当スタッフID: staffUser.ID,
    開始日時: new Date().toISOString(),
    状態: '来店済み',
    所要時間: 60,
    バージョン: 1,
};

const treatment2: z.infer<typeof TreatmentTable.schema> = {
    ID: utilities.getUuid(),
    顧客ID: customer2.ID,
    担当スタッフID: staffUser.ID,
    開始日時: new Date().toISOString(),
    状態: '来店済み',
    所要時間: 30,
    バージョン: 1,
};

const treatments = [treatment1, treatment2];

const treatmentMenu1: z.infer<typeof TreatmentMenuTable.schema> = {
    ID: utilities.getUuid(),
    施術ID: treatment1.ID,
    メニューID: menu1.ID,
    メニュー名: menu1.名称,
    数量: 1,
    通常価格: menu1.価格,
    値引き額: 0,
    表示順: 1,
    バージョン: 1,
};

const treatmentMenu2: z.infer<typeof TreatmentMenuTable.schema> = {
    ID: utilities.getUuid(),
    施術ID: treatment1.ID,
    メニューID: menu2.ID,
    メニュー名: menu2.名称,
    数量: 1,
    通常価格: menu2.価格,
    値引き額: 0,
    表示順: 1,
    バージョン: 1,
};

const treatmentMenu3: z.infer<typeof TreatmentMenuTable.schema> = {
    ID: utilities.getUuid(),
    施術ID: treatment2.ID,
    メニューID: menu1.ID,
    メニュー名: menu1.名称,
    数量: 1,
    通常価格: menu1.価格,
    値引き額: 0,
    表示順: 2,
    バージョン: 1,
};

const treatmentMenus = [treatmentMenu1, treatmentMenu2, treatmentMenu3];

const registerTerminal1Id = utilities.getUuid();
const registerTerminal1: z.infer<typeof RegisterTerminalTable.schema> = {
    ID: registerTerminal1Id,
    トークンハッシュ: passwordProtection.execute(
        'RGT-1111-1111-1111',
        registerTerminal1Id
    ),
    発行日時: new Date().toISOString(),
    有効: true,
    端末名: 'レジ端末1',
    最終利用日時: new Date().toISOString(),
    バージョン: 1,
    登録者ID: adminUserId,
    更新者ID: null,
};

const recordToRow = <T extends Record<string, unknown>>(
    headers: string[],
    record: T
) => headers.map((header) => record[header]);

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
dataStore.set(`${EmployeeTable.dbId}:${EmployeeTable.name}`, [
    Object.keys(EmployeeTable.schema.def.shape),
    ...employees.map((employee) => Object.values(employee)),
]);
dataStore.set(`${CustomerTable.dbId}:${CustomerTable.name}`, [
    Object.keys(CustomerTable.schema.def.shape),
    recordToRow(
        Object.keys(CustomerTable.schema.def.shape),
        CustomerTable.serialize(CustomerTable.deserialize(customer1))
    ),
    recordToRow(
        Object.keys(CustomerTable.schema.def.shape),
        CustomerTable.serialize(CustomerTable.deserialize(customer2))
    ),
]);
dataStore.set(`${TreatmentTable.dbId}:${TreatmentTable.name}`, [
    Object.keys(TreatmentTable.schema.def.shape),
    ...treatments.map((treatment) =>
        recordToRow(
            Object.keys(TreatmentTable.schema.def.shape),
            TreatmentTable.serialize(TreatmentTable.deserialize(treatment))
        )
    ),
]);
dataStore.set(`${TreatmentMenuTable.dbId}:${TreatmentMenuTable.name}`, [
    Object.keys(TreatmentMenuTable.schema.def.shape),
    ...treatmentMenus.map((treatmentMenu) =>
        recordToRow(
            Object.keys(TreatmentMenuTable.schema.def.shape),
            TreatmentMenuTable.serialize(
                TreatmentMenuTable.deserialize(treatmentMenu)
            )
        )
    ),
]);
dataStore.set(`${MenuTable.dbId}:${MenuTable.name}`, [
    Object.keys(MenuTable.schema.def.shape),
    ...menus.map((menu) =>
        recordToRow(
            Object.keys(MenuTable.schema.def.shape),
            MenuTable.serialize(MenuTable.deserialize(menu))
        )
    ),
]);
dataStore.set(`${RegisterTerminalTable.dbId}:${RegisterTerminalTable.name}`, [
    Object.keys(RegisterTerminalTable.schema.def.shape),
    recordToRow(
        Object.keys(RegisterTerminalTable.schema.def.shape),
        RegisterTerminalTable.serialize(
            RegisterTerminalTable.deserialize(registerTerminal1)
        )
    ),
]);

dataStore.dump();

export { testContainer as container };
