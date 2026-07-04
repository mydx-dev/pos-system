import { SheetTable } from '@mydx-dev/gas-boost-runtime/core';
import { Customer } from '../../../shared/domain/entity/Customer';
import { Employee } from '../../../shared/domain/entity/Employee';
import { Menu } from '../../../shared/domain/entity/Menu';
import { MenuCategory } from '../../../shared/domain/entity/MenuCategory';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { PaymentRecord } from '../../../shared/domain/entity/PaymentRecord';
import { RegisterTerminal } from '../../../shared/domain/entity/RegisterTerminal';
import { Role } from '../../../shared/domain/entity/Role';
import { Treatment } from '../../../shared/domain/entity/Treatment';
import { TreatmentMenu } from '../../../shared/domain/entity/TreatmentMenu';
import { User } from '../../../shared/domain/entity/User';
import {
    customerSchema,
    employeeSchema,
    menuCategorySchema,
    menuSchema,
    passwordResetSchema,
    paymentRecordSchema,
    permissionSchema,
    registerTerminalSchema,
    treatmentMenuSchema,
    treatmentSchema,
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

export const RegisterTerminalTable = new SheetTable(
    '',
    'レジ端末',
    registerTerminalSchema,
    'ID',
    false,
    (record) =>
        new RegisterTerminal(
            record.ID,
            record.端末名,
            record.トークンハッシュ,
            record.有効,
            record.発行日時,
            record.最終利用日時,
            record.登録者ID,
            record.更新者ID,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        端末名: entity.name,
        トークンハッシュ: entity.tokenHash,
        有効: entity.enabled,
        発行日時: entity.issuedAt,
        最終利用日時: entity.lastUsedAt,
        登録者ID: entity.createdBy,
        更新者ID: entity.updatedBy,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
    }
);

RegisterTerminalTable.reference('登録者ID', UserTable, 'ID', 'restrict');
RegisterTerminalTable.reference('更新者ID', UserTable, 'ID', 'set null');

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

export const CustomerTable = new SheetTable(
    '',
    '顧客',
    customerSchema,
    'ID',
    true,
    (record) =>
        new Customer(
            record.ID,
            record.氏名,
            record.主担当スタッフID,
            record.担当固定,
            record.メールアドレス,
            record.電話番号,
            record.生年月日,
            record.郵便番号,
            record.住所,
            record.備考,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        氏名: entity.name,
        主担当スタッフID: entity.primaryStaffId,
        担当固定: entity.isStaffFixed,
        メールアドレス: entity.email,
        電話番号: entity.phoneNumber,
        生年月日: entity.birthDate,
        郵便番号: entity.postalCode,
        住所: entity.address,
        備考: entity.note,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

CustomerTable.reference(
    '主担当スタッフID',
    EmployeeTable,
    'ユーザーID',
    'set null'
);

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

export const TreatmentTable = new SheetTable(
    '',
    '施術',
    treatmentSchema,
    'ID',
    true,
    (record) =>
        new Treatment(
            record.ID,
            record.顧客ID,
            record.担当スタッフID,
            record.状態,
            record.開始日時,
            record.所要時間,
            record.備考,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        顧客ID: entity.customerId,
        担当スタッフID: entity.staffId,
        状態: entity.status,
        開始日時: entity.startAt,
        所要時間: entity.duration,
        備考: entity.note,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

TreatmentTable.reference('顧客ID', CustomerTable, 'ID', 'restrict');
TreatmentTable.reference(
    '担当スタッフID',
    EmployeeTable,
    'ユーザーID',
    'restrict'
);

export const TreatmentMenuTable = new SheetTable(
    '',
    '施術メニュー',
    treatmentMenuSchema,
    'ID',
    true,
    (record) =>
        new TreatmentMenu(
            record.ID,
            record.施術ID,
            record.メニューID,
            record.メニュー名,
            record.通常価格,
            record.数量,
            record.値引き額,
            record.表示順,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        施術ID: entity.treatmentId,
        メニューID: entity.menuId,
        メニュー名: entity.menuName,
        通常価格: entity.regularPrice,
        数量: entity.quantity,
        値引き額: entity.discountAmount,
        表示順: entity.displayOrder,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

TreatmentMenuTable.reference('施術ID', TreatmentTable, 'ID', 'cascade');
TreatmentMenuTable.reference('メニューID', MenuTable, 'ID', 'restrict');

export const PaymentRecordTable = new SheetTable(
    '',
    '精算履歴',
    paymentRecordSchema,
    'ID',
    true,
    (record) =>
        new PaymentRecord(
            record.ID,
            record.施術ID,
            record.種別,
            record.金額,
            record.支払方法,
            record.発生日時,
            record.備考,
            record.対象精算ID,
            record.バージョン
        ),
    (entity) => ({
        ID: entity.id,
        施術ID: entity.treatmentId,
        種別: entity.type,
        金額: entity.amount,
        支払方法: entity.paymentMethod,
        発生日時: entity.occurredAt,
        備考: entity.note,
        対象精算ID: entity.targetPaymentRecordId,
        バージョン: entity.version,
    }),
    {
        versionColumn: 'バージョン',
        autoNumberingMode: 'uuid',
    }
);

PaymentRecordTable.reference('施術ID', TreatmentTable, 'ID', 'cascade');
PaymentRecordTable.reference(
    '対象精算ID',
    PaymentRecordTable,
    'ID',
    'restrict'
);

export const ALL_TABLES = [
    UserTable,
    RoleTable,
    PasswordResetTable,
    RegisterTerminalTable,
    EmployeeTable,
    CustomerTable,
    MenuCategoryTable,
    MenuTable,
    TreatmentTable,
    TreatmentMenuTable,
    PaymentRecordTable,
] as const;

export type AllTableName = (typeof ALL_TABLES)[number]['name'];
