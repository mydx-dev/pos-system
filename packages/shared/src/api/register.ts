import { z } from 'zod';
import { treatmentStatus } from '../domain/entity/Treatment';
import {
    customerSchema,
    menuCategorySchema,
    menuSchema,
    paymentRecordSchema,
    treatmentMenuSchema,
    treatmentSchema,
    userId,
} from '../schemas/database';
import { paymentRecordSummarySchema } from './paymentRecord';

const registerTerminalTokenRequest = z.object({
    registerTerminalToken: z.string(),
});

export const listRegisterTreatmentsRequest = registerTerminalTokenRequest;
export type ListRegisterTreatmentsRequest = z.infer<
    typeof listRegisterTreatmentsRequest
>;

export const listRegisterTreatmentsResponse = z.object({
    treatments: z.array(
        z.object({
            ID: z.string().uuidv4(),
            顧客ID: z.string().uuidv4(),
            顧客名: z.string(),
            担当スタッフID: userId,
            担当スタッフ名: z.string(),
            状態: z.enum(treatmentStatus),
            開始日時: z.string(),
            合計金額: z.number().int(),
            バージョン: z.number(),
        })
    ),
});
export type ListRegisterTreatmentsResponse = z.infer<
    typeof listRegisterTreatmentsResponse
>;

export const getRegisterTreatmentDetailRequest =
    registerTerminalTokenRequest.extend({
        treatmentId: z.string().uuidv4(),
    });
export type GetRegisterTreatmentDetailRequest = z.infer<
    typeof getRegisterTreatmentDetailRequest
>;

export const getRegisterTreatmentDetailResponse = z.object({
    treatment: treatmentSchema,
    customer: customerSchema,
    staff: z.object({
        ユーザーID: userId,
        氏名: z.string(),
    }),
    treatmentMenus: z.array(treatmentMenuSchema),
    paymentRecords: z.array(paymentRecordSchema),
    summary: paymentRecordSummarySchema,
});
export type GetRegisterTreatmentDetailResponse = z.infer<
    typeof getRegisterTreatmentDetailResponse
>;

export const listRegisterMenusRequest = registerTerminalTokenRequest;
export type ListRegisterMenusRequest = z.infer<
    typeof listRegisterMenusRequest
>;

export const listRegisterMenusResponse = z.object({
    menuCategories: z.array(menuCategorySchema),
    menus: z.array(menuSchema),
});
export type ListRegisterMenusResponse = z.infer<
    typeof listRegisterMenusResponse
>;
