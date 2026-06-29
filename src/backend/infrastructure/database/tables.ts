import { SheetTable } from '@mydx-dev/gas-boost-runtime/core';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import {
    passwordResetSchema,
    permissionSchema,
    userSchema,
} from '../../../shared/schemas/database';

export const UserTable = new SheetTable(
    '',
    'ユーザー',
    userSchema,
    'ID',
    false,
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

export const ALL_TABLES = [UserTable, RoleTable, PasswordResetTable] as const;

export type AllTableName = (typeof ALL_TABLES)[number]['name'];
