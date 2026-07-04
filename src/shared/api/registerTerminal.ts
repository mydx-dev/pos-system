import { z } from 'zod';
import { registerTerminalSchema } from '../schemas/database';

export const registerTerminalPlaneTokenSchema = z
    .string()
    .regex(/^RGT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

export const createRegisterTerminalRequest = z.object({
    sessionToken: z.string(),
    terminal: registerTerminalSchema.pick({
        端末名: true,
    }),
});
export type CreateRegisterTerminalRequest = z.infer<
    typeof createRegisterTerminalRequest
>;

export const createRegisterTerminalResponse = z.object({
    registerTerminal: registerTerminalSchema.omit({
        トークンハッシュ: true,
        登録者ID: true,
        更新者ID: true,
    }),
    plainToken: registerTerminalPlaneTokenSchema,
});
export type CreateRegisterTerminalResponse = z.infer<
    typeof createRegisterTerminalResponse
>;

export const refreshRegisterTerminalTokenRequest = z.object({
    sessionToken: z.string(),
    registerTerminalId: z.string().uuidv4(),
    バージョン: z.number(),
});
export type RefreshRegisterTerminalTokenRequest = z.infer<
    typeof refreshRegisterTerminalTokenRequest
>;

export const refreshRegisterTerminalTokenResponse =
    createRegisterTerminalResponse;
export type RefreshRegisterTerminalTokenResponse = z.infer<
    typeof refreshRegisterTerminalTokenResponse
>;

export const loginRegisterTerminalRequest = z.object({
    token: z.string(),
});
export type LoginRegisterTerminalRequest = z.infer<
    typeof loginRegisterTerminalRequest
>;

export const loginRegisterTerminalResponse = z.object({
    registerTerminal: registerTerminalSchema
        .pick({
            ID: true,
            端末名: true,
            有効: true,
            最終利用日時: true,
        })
        .extend({
            最終利用日時: z.string(),
        }),
});
export type LoginRegisterTerminalResponse = z.infer<
    typeof loginRegisterTerminalResponse
>;
