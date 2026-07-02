import { z } from 'zod';
import { productType, taxType } from '../domain/entity/Menu';
import { menuType } from '../domain/entity/MenuCategory';
import { roleName } from '../domain/entity/Role';

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

export const employeeSchema = z.object({
    ユーザーID: userId.meta({ unique: true }),
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
