import { z } from 'zod';
import {
    paymentMethod,
    paymentRecordType,
} from '../domain/entity/PaymentRecord';
import { paymentRecordSchema } from '../schemas/database';

export const paymentRecordSummarySchema = z.object({
    精算合計: z.number().int(),
    取消合計: z.number().int(),
    返金合計: z.number().int(),
    差引売上: z.number().int(),
});
export type PaymentSummary = z.infer<typeof paymentRecordSummarySchema>;

export const createPaymentRecordRequest = z.object({
    sessionToken: z.string(),
    paymentRecord: paymentRecordSchema
        .pick({
            施術ID: true,
            種別: true,
            金額: true,
            支払方法: true,
            備考: true,
            対象精算ID: true,
        })
        .extend({
            種別: z.enum(paymentRecordType),
            金額: z.number().int().positive(),
            支払方法: z.enum(paymentMethod),
            備考: z.string().nullish(),
            対象精算ID: z.string().uuidv4().nullish(),
        }),
});
export type CreatePaymentRecordRequest = z.infer<
    typeof createPaymentRecordRequest
>;

export const createPaymentRecordResponse = z.object({
    paymentRecord: paymentRecordSchema,
    treatment: z
        .object({
            ID: z.string().uuidv4(),
            状態: z.enum(['予約済み', '来店済み', '精算済み']),
            バージョン: z.number(),
        })
        .nullish(),
    summary: paymentRecordSummarySchema,
});
export type CreatePaymentRecordResponse = z.infer<
    typeof createPaymentRecordResponse
>;
