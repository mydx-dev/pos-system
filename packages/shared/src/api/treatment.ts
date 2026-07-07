import { z } from 'zod';
import { treatmentStatus } from '../domain/entity/Treatment';
import { treatmentMenuSchema, treatmentSchema } from '../schemas/database';

export const createTreatmentRequest = z.object({
    sessionToken: z.string(),
    treatment: treatmentSchema
        .pick({
            顧客ID: true,
            担当スタッフID: true,
            状態: true,
            開始日時: true,
            所要時間: true,
            備考: true,
        })
        .extend({
            状態: z.enum(treatmentStatus).optional(),
            所要時間: z.number().int().min(0),
            備考: z.string().nullish(),
        }),
    treatmentMenus: z.array(
        treatmentMenuSchema
            .pick({
                メニューID: true,
                数量: true,
                値引き額: true,
                表示順: true,
            })
            .extend({
                数量: z.number().int().min(1),
                値引き額: z.number().int().min(0),
                表示順: z.number().int(),
            })
    ),
});
export type CreateTreatmentRequest = z.infer<typeof createTreatmentRequest>;

export const createTreatmentResponse = z.object({
    treatment: treatmentSchema.extend({
        終了日時: z.string(),
    }),
    treatmentMenus: z.array(treatmentMenuSchema),
});
export type CreateTreatmentResponse = z.infer<typeof createTreatmentResponse>;

export const saveTreatmentMenusRequest = z.object({
    sessionToken: z.string().uuidv4(),
    treatmentId: treatmentSchema.shape.ID,
    treatmentMenus: z.array(
        treatmentMenuSchema
            .pick({
                ID: true,
                メニューID: true,
                数量: true,
                値引き額: true,
                表示順: true,
                バージョン: true,
            })
            .extend({
                ID: z.union([z.string().uuidv4(), z.literal('')]),
                数量: z.number().int().min(1),
                値引き額: z.number().int().min(0),
                表示順: z.number().int(),
                バージョン: z.number().optional(),
            })
    ),
    deletedTreatmentMenuIds: z.array(treatmentMenuSchema.shape.ID),
});
export type SaveTreatmentMenusRequest = z.infer<
    typeof saveTreatmentMenusRequest
>;

export const saveTreatmentMenusResponse = z.object({
    treatmentMenus: z.array(treatmentMenuSchema),
    deletedTreatmentMenuIds: z.array(treatmentMenuSchema.shape.ID),
});
export type SaveTreatmentMenusResponse = z.infer<
    typeof saveTreatmentMenusResponse
>;
