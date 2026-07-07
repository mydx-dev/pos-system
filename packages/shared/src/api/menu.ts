import { z } from 'zod';
import { menuSchema } from '../schemas/database';

export const saveMenuRequest = z.object({
    sessionToken: z.string().uuidv4(),
    menus: z.array(
        menuSchema.extend({
            ID: z.union([z.string().uuidv4(), z.literal('')]),
        })
    ),
    deletedMenuIds: z.array(menuSchema.shape.ID),
});
export type SaveMenuRequest = z.infer<typeof saveMenuRequest>;

export const saveMenuResponse = z.object({
    menus: z.array(menuSchema),
    deletedMenuIds: z.array(menuSchema.shape.ID),
});
export type SaveMenuResponse = z.infer<typeof saveMenuResponse>;
