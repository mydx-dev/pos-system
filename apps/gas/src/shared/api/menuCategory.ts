import { z } from 'zod';
import { menuCategorySchema } from '../schemas/database';

export const saveMenuCategoryRequest = z.object({
    sessionToken: z.string().uuidv4(),
    menuCategories: z.array(
        menuCategorySchema.extend({
            ID: z.union([z.string().uuidv4(), z.literal('')]),
        })
    ),
    deletedMenuCategoryIds: z.array(menuCategorySchema.shape.ID),
});
export type SaveMenuCategoryRequest = z.infer<typeof saveMenuCategoryRequest>;

export const saveMenuCategoryResponse = z.object({
    menuCategories: z.array(menuCategorySchema),
    deletedMenuCategoryIds: z.array(menuCategorySchema.shape.ID),
});
export type SaveMenuCategoryResponse = z.infer<typeof saveMenuCategoryResponse>;
