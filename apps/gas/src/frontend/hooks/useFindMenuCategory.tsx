import { SheetQuery } from '@mydx-dev/gas-boost-runtime/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { MenuCategory } from '@mydx-pos/shared/domain/entity/MenuCategory';
import { menuCategorySchema } from '@mydx-pos/shared/schemas/database';
import { replicaQL } from '../lib/AppsScriptClient';

export const useFindMenuCategory = (
    query: SheetQuery<
        typeof ALL_TABLES,
        typeof menuCategorySchema
    > = new SheetQuery()
) => {
    return useLiveQuery(async () => {
        const result = await replicaQL.table('メニューカテゴリー').find(query);
        return result as MenuCategory[];
    }, [JSON.stringify(query)]);
};
