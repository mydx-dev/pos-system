import { SheetTable } from '@mydx-dev/gas-boost-runtime/core';
import { Employee } from '../../../shared/domain/entity/Employee';
import { MenuCategory } from '../../../shared/domain/entity/MenuCategory';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import {
    employeeSchema,
    menuCategorySchema,
    passwordResetSchema,
    permissionSchema,
    userSchema,
} from '../../../shared/schemas/database';

export const UserTable = new SheetTable(
    '',
    'ユーザー',
    userSchema,
    'ID',
    true,
    (record) =>
        new User(
            record.ID,
            record.氏名,
            record.メールアドレス,
            record.パスワード,
            record.承認,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        氏名: entity.name,
        メールアドレス: entity.email,
        パスワード: entity.password,
        承認: entity.approval,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

export const RoleTable = new SheetTable(
    '',
    'ロール',
    permissionSchema,
    'ユーザーID',
    false,
    (record) => new Role(record.ユーザーID, record.名称),
    (entity) => ({
        ユーザーID: entity.userId,
        名称: entity.name,
    })
);

RoleTable.reference('ユーザーID', UserTable, 'ID', 'cascade');

export const PasswordResetTable = new SheetTable(
    '',
    'パスワードリセット',
    passwordResetSchema,
    'ユーザーID',
    false,
    (record) =>
        new PasswordReset(record.ユーザーID, record.トークン, record.有効期限),
    (entity) => ({
        ユーザーID: entity.userId,
        トークン: entity.token,
        有効期限: entity.expiresAt,
    })
);

export const EmployeeTable = new SheetTable(
    '',
    'スタッフ',
    employeeSchema,
    'ユーザーID',
    false,
    (record) => new Employee(record.ユーザーID),
    (entity) => ({
        ユーザーID: entity.userId,
    })
);

EmployeeTable.reference('ユーザーID', UserTable, 'ID', 'cascade');

export const MenuCategoryTable = new SheetTable(
    '',
    'メニューカテゴリー',
    menuCategorySchema,
    'ID',
    true,
    (record) =>
        new MenuCategory(
            record.ID,
            record.名称,
            record.種別,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        名称: entity.name,
        種別: entity.menuType,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

export const ALL_TABLES = [
    UserTable,
    RoleTable,
    PasswordResetTable,
    EmployeeTable,
    MenuCategoryTable,
] as const;

export type AllTableName = (typeof ALL_TABLES)[number]['name'];
