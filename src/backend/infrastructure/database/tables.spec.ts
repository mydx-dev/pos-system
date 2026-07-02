import { vi } from 'vitest';
import { TableSpec } from '../../../../tests/helpers/TableSpec';
import { Customer } from '../../../shared/domain/entity/Customer';
import { Employee } from '../../../shared/domain/entity/Employee';
import { Menu } from '../../../shared/domain/entity/Menu';
import { MenuCategory } from '../../../shared/domain/entity/MenuCategory';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import {
    EmployeeTable,
    CustomerTable,
    MenuCategoryTable,
    MenuTable,
    PasswordResetTable,
    RoleTable,
    UserTable,
} from './tables';

const uuidv4 = '123e4567-e89b-42d3-a456-426614174000';
vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

const userTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'ユーザー',
        主キー: 'ID',
        自動採番: 'uuid',
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

const employeeTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'スタッフ',
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
    },
    マッピング: {
        エンティティ: new Employee(uuidv4),
        レコード: {
            ユーザーID: uuidv4,
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

employeeTableSpec.toEqual(EmployeeTable);

const customerTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: '顧客',
        主キー: 'ID',
        自動採番: 'uuid',
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
        主担当スタッフID: {
            データ型: 'string',
            必須: false,
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
        担当固定: {
            データ型: 'boolean',
            必須: true,
            ユニーク: false,
        },
        メールアドレス: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
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
        電話番号: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
        },
        生年月日: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
        },
        郵便番号: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
        },
        住所: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
        },
        備考: {
            データ型: 'string',
            必須: false,
            ユニーク: false,
        },
        バージョン: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
        },
    },
    マッピング: {
        エンティティ: new Customer(
            uuidv4,
            'Test Customer',
            uuidv4,
            false,
            'test@example.com',
            '09012345678',
            '1990-01-01',
            '1000001',
            '東京都千代田区',
            '備考',
            1
        ),
        レコード: {
            ID: uuidv4,
            氏名: 'Test Customer',
            主担当スタッフID: uuidv4,
            担当固定: false,
            メールアドレス: 'test@example.com',
            電話番号: '09012345678',
            生年月日: '1990-01-01',
            郵便番号: '1000001',
            住所: '東京都千代田区',
            備考: '備考',
            バージョン: 1,
        },
    },
    リレーション: {
        主担当スタッフID: {
            参照先テーブル: EmployeeTable,
            参照先カラム: 'ユーザーID',
            削除: 'set null',
        },
    },
});

customerTableSpec.toEqual(CustomerTable);

const menuCategoryTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'メニューカテゴリー',
        主キー: 'ID',
        自動採番: 'uuid',
        楽観的更新: 'バージョン',
    },

    スキーマ: {
        ID: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                UUIDv4形式: {
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
            データ型: 'string',
            必須: true,
            ユニーク: true,
        },

        種別: {
            データ型: 'enum',
            必須: true,
            ユニーク: false,
            バリデーション: {
                技術: {
                    評価: true,
                    値: '技術',
                },
                商品: {
                    評価: true,
                    値: '商品',
                },
                不正値: {
                    評価: false,
                    値: '不正値',
                },
            },
        },

        バージョン: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
        },
    },

    マッピング: {
        エンティティ: new MenuCategory(uuidv4, 'カット', '技術', 1),

        レコード: {
            ID: uuidv4,
            名称: 'カット',
            種別: '技術',
            バージョン: 1,
        },
    },
});

menuCategoryTableSpec.toEqual(MenuCategoryTable);

const menuTableSpec = new TableSpec({
    メタデータ: {
        テーブル名: 'メニュー',
        主キー: 'ID',
        自動採番: 'uuid',
        楽観的更新: 'バージョン',
    },

    スキーマ: {
        ID: {
            データ型: 'string',
            必須: true,
            ユニーク: true,
            バリデーション: {
                UUIDv4形式: {
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
            データ型: 'string',
            必須: true,
            ユニーク: true,
        },

        メニュー番号: {
            データ型: 'string',
            必須: true,
            ユニーク: false,
        },

        価格: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
            バリデーション: {
                整数: {
                    評価: true,
                    値: 5000,
                },
                小数: {
                    評価: false,
                    値: 5000.5,
                },
            },
        },

        仕入れ単価: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
            バリデーション: {
                整数: {
                    評価: true,
                    値: 1000,
                },
                小数: {
                    評価: false,
                    値: 1000.5,
                },
            },
        },

        税区分: {
            データ型: 'enum',
            必須: true,
            ユニーク: false,
            バリデーション: {
                内税: {
                    評価: true,
                    値: '内税',
                },
                外税: {
                    評価: true,
                    値: '外税',
                },
                不正値: {
                    評価: false,
                    値: '不正値',
                },
            },
        },

        商品区分: {
            データ型: 'enum',
            必須: true,
            ユニーク: false,
            バリデーション: {
                店販用: {
                    評価: true,
                    値: '店販用',
                },
                業務用: {
                    評価: true,
                    値: '業務用',
                },
                両用: {
                    評価: true,
                    値: '両用',
                },
                不正値: {
                    評価: false,
                    値: '不正値',
                },
            },
        },

        種別: {
            データ型: 'enum',
            必須: true,
            ユニーク: false,
            バリデーション: {
                技術: {
                    評価: true,
                    値: '技術',
                },
                商品: {
                    評価: true,
                    値: '商品',
                },
                不正値: {
                    評価: false,
                    値: '不正値',
                },
            },
        },

        カテゴリーID: {
            データ型: 'string',
            必須: true,
            ユニーク: false,
            バリデーション: {
                UUIDv4形式: {
                    評価: true,
                    値: uuidv4,
                },
                非UUIDv4形式: {
                    評価: false,
                    値: 'invalid-uuid',
                },
            },
        },

        バージョン: {
            データ型: 'number',
            必須: true,
            ユニーク: false,
        },
    },

    マッピング: {
        エンティティ: new Menu(
            uuidv4,
            'カット',
            'T-001',
            5000,
            1000,
            '内税',
            '業務用',
            '技術',
            uuidv4,
            1
        ),

        レコード: {
            ID: uuidv4,
            名称: 'カット',
            メニュー番号: 'T-001',
            価格: 5000,
            仕入れ単価: 1000,
            税区分: '内税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: uuidv4,
            バージョン: 1,
        },
    },
});

menuTableSpec.toEqual(MenuTable);
