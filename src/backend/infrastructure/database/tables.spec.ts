import { vi } from 'vitest';
import { TableSpec } from '../../../../tests/helpers/TableSpec';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { PasswordResetTable, RoleTable, UserTable } from './tables';

const uuidv4 = '123e4567-e89b-42d3-a456-426614174000';
vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

const userTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'ユーザー',
        主キー: 'ID',
        自動採番: false,
        楽観的更新: 'バージョン',
    },
    スキーマ: {
        ID: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                UUODv4形式: {
                    評価: true,
                    値: uuidv4,
                },
                非UUIDv4形式: {
                    評価: false,
                    値: 'invalid-uuid',
                },
            },
        },
        氏名: {
            データ型: 'string',
            必須: true,
            ユニーク: false,
        },
        メールアドレス: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                メールアドレス形式: {
                    評価: true,
                    値: 'test@example.com',
                },
                非メールアドレス形式: {
                    評価: false,
                    値: 'invalid-email',
                },
            },
        },
        パスワード: {
            データ型: 'string',
            必須: true,
            ユニーク: false,
        },
        承認: {
            データ型: 'boolean',
            必須: true,
            ユニーク: false,
        },
        バージョン: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
        },
    },
    マッピング: {
        エンティティ: new User(
            uuidv4,
            'Test User',
            'test@example.com',
            'password',
            true,
            1
        ),
        レコード: {
            ID: uuidv4,
            氏名: 'Test User',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: true,
            バージョン: 1,
        },
    },
});

userTableSpec.toEqual(UserTable);

const roleTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'ロール',
        主キー: 'ユーザーID',
        自動採番: false,
    },
    スキーマ: {
        ユーザーID: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                UUODv4形式: {
                    評価: true,
                    値: uuidv4,
                },
                非UUIDv4形式: {
                    評価: false,
                    値: 'invalid-uuid',
                },
            },
        },
        名称: {
            データ型: 'enum',
            必須: true,
            ユニーク: false,
            バリデーション: {
                システム管理者もしくはユーザーでない場合エラーになる: {
                    評価: false,
                    値: 'invalid-permission',
                },
                システム管理者の場合はエラーにならない: {
                    評価: true,
                    値: 'システム管理者',
                },
                ユーザーの場合はエラーにならない: {
                    評価: true,
                    値: 'ユーザー',
                },
            },
        },
    },
    マッピング: {
        エンティティ: new Role(uuidv4, 'システム管理者'),
        レコード: {
            ユーザーID: uuidv4,
            名称: 'システム管理者',
        },
    },
    リレーション: {
        ユーザーID: {
            参照先テーブル: UserTable,
            参照先カラム: 'ID',
            削除: 'cascade',
        },
    },
});

roleTableSpec.toEqual(RoleTable);

const passwordResetTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'パスワードリセット',
        主キー: 'ユーザーID',
        自動採番: false,
    },
    スキーマ: {
        ユーザーID: {
            データ型: 'string',
            必須: true,
            ユニーク: false,
            バリデーション: {
                UUODv4形式: {
                    評価: true,
                    値: uuidv4,
                },
                非UUIDv4形式: {
                    評価: false,
                    値: 'invalid-uuid',
                },
            },
        },
        トークン: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                UUODv4形式: {
                    評価: true,
                    値: uuidv4,
                },
                非UUIDv4形式: {
                    評価: false,
                    値: 'invalid-uuid',
                },
            },
        },
        有効期限: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
        },
    },
    マッピング: {
        エンティティ: new PasswordReset(
            uuidv4,
            uuidv4,
            Date.now() + 3600 * 1000
        ),
        レコード: {
            ユーザーID: uuidv4,
            トークン: uuidv4,
            有効期限: Date.now() + 3600 * 1000,
        },
    },
});

passwordResetTableSpec.toEqual(PasswordResetTable);
