import { SheetTable } from '@mydx-dev/gas-boost-runtime/core';
import { Employee } from '../../../shared/domain/entity/Employee';
import { Menu } from '../../../shared/domain/entity/Menu';
import { MenuCategory } from '../../../shared/domain/entity/MenuCategory';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import {
    employeeSchema,
    menuSchema,
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

export const MenuTable = new SheetTable(
    '',
    'メニュー',
    menuSchema,
    'ID',
    true,
    (record) =>
        new Menu(
            record.ID,
            record.名称,
            record.メニュー番号,
            record.価格,
            record.仕入れ単価,
            record.税区分,
            record.商品区分,
            record.種別,
            record.カテゴリーID,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        名称: entity.name,
        メニュー番号: entity.menuNumber,
        価格: entity.price,
        仕入れ単価: entity.costPrice,
        税区分: entity.taxType,
        商品区分: entity.productType,
        種別: entity.menuType,
        カテゴリーID: entity.categoryId,
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
    MenuTable,
] as const;

export type AllTableName = (typeof ALL_TABLES)[number]['name'];
