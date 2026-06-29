import { z } from 'zod';
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
