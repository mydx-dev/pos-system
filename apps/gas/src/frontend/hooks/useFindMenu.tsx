import { SheetQuery } from '@mydx-dev/gas-boost-runtime/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { Menu } from '@mydx-pos/shared/domain/entity/Menu';
import { menuSchema } from '@mydx-pos/shared/schemas/database';
import { replicaQL } from '../lib/AppsScriptClient';

export const useFindMenu = (
    query: SheetQuery<typeof ALL_TABLES, typeof menuSchema> = new SheetQuery()
) => {
    return useLiveQuery(async () => {
        const result = await replicaQL.table('メニュー').find(query);
        return result as Menu[];
    }, [JSON.stringify(query)]);
};
