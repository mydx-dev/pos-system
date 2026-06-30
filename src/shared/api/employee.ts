import { z } from 'zod';
import { employeeSchema, userSchema } from '../schemas/database';

export const createEmployeeInput = z.object({
    sessionToken: z.string(),
    employee: userSchema.pick({
        氏名: true,
        メールアドレス: true,
    }),
});
export type CreateEmployeeInput = z.infer<typeof createEmployeeInput>;

export const createEmployeeOutput = z.object({
    user: userSchema,
    employee: employeeSchema,
});
export type CreateEmployeeOutput = z.infer<typeof createEmployeeOutput>;
