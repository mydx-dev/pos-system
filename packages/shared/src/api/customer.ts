import { z } from 'zod';
import { customerSchema } from '../schemas/database';

export const createCustomerInput = z.object({
    sessionToken: z.string(),
    customer: customerSchema
        .pick({
            氏名: true,
            主担当スタッフID: true,
            担当固定: true,
            メールアドレス: true,
            電話番号: true,
            生年月日: true,
            郵便番号: true,
            住所: true,
            備考: true,
        })
        .extend({
            氏名: z.string().min(1),
            担当固定: z.boolean().optional(),
        }),
});
export type CreateCustomerInput = z.infer<typeof createCustomerInput>;

export const createCustomerOutput = z.object({
    customer: customerSchema,
});
export type CreateCustomerOutput = z.infer<typeof createCustomerOutput>;
