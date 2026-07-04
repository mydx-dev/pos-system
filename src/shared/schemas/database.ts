import { z } from 'zod';
import { productType, taxType } from '../domain/entity/Menu';
import { menuType } from '../domain/entity/MenuCategory';
import {
    paymentMethod,
    paymentRecordType,
} from '../domain/entity/PaymentRecord';
import { roleName } from '../domain/entity/Role';
import { treatmentStatus } from '../domain/entity/Treatment';

export const userId = z.string().uuidv4();
export const userSchema = z.object({
    ID: userId.meta({ unique: true }),
    氏名: z.string(),
    メールアドレス: z.string().email().meta({ unique: true }),
    パスワード: z.string(),
    承認: z.boolean(),
    バージョン: z.number(),
});

export const permissionSchema = z.object({
    ユーザーID: userId.meta({ unique: true }),
    名称: z.enum(roleName),
});

export const passwordResetSchema = z.object({
    ユーザーID: userId,
    トークン: z.string().uuidv4().meta({ unique: true }),
    有効期限: z.number(),
});

export const registerTerminalSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    端末名: z.string(),
    トークンハッシュ: z.string(),
    有効: z.boolean(),
    発行日時: z.string(),
    最終利用日時: z.string().nullish(),
    登録者ID: userId,
    更新者ID: userId.nullish(),
    バージョン: z.number(),
});

export const employeeSchema = z.object({
    ユーザーID: userId.meta({ unique: true }),
});

export const customerSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    氏名: z.string(),
    主担当スタッフID: userId.nullish(),
    担当固定: z.boolean(),
    メールアドレス: z.string().email().nullish(),
    電話番号: z.string().nullish(),
    生年月日: z.string().nullish(),
    郵便番号: z.string().nullish(),
    住所: z.string().nullish(),
    備考: z.string().nullish(),
    バージョン: z.number(),
});

export const menuCategorySchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    名称: z.string().meta({ unique: true }),
    種別: z.enum(menuType),
    バージョン: z.number(),
});

export const menuSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    名称: z.string().meta({ unique: true }),
    メニュー番号: z.string(),
    価格: z.number().int(),
    仕入れ単価: z.number().int(),
    税区分: z.enum(taxType),
    商品区分: z.enum(productType),
    種別: z.enum(menuType),
    カテゴリーID: z.string().uuidv4(),
    バージョン: z.number(),
});

export const treatmentSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    顧客ID: z.string().uuidv4(),
    担当スタッフID: userId,
    状態: z.enum(treatmentStatus),
    開始日時: z.string(),
    所要時間: z.number().int().min(0),
    備考: z.string().nullish(),
    バージョン: z.number(),
});

export const treatmentMenuSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    施術ID: z.string().uuidv4(),
    メニューID: z.string().uuidv4(),
    メニュー名: z.string(),
    通常価格: z.number().int(),
    数量: z.number().int().min(1),
    値引き額: z.number().int().min(0),
    表示順: z.number().int(),
    バージョン: z.number(),
});

export const paymentRecordSchema = z.object({
    ID: z.string().uuidv4().meta({ unique: true }),
    施術ID: z.string().uuidv4(),
    種別: z.enum(paymentRecordType),
    金額: z.number().int().positive(),
    支払方法: z.enum(paymentMethod),
    発生日時: z.string(),
    備考: z.string().nullish(),
    対象精算ID: z.string().uuidv4().nullish(),
    バージョン: z.number(),
});
