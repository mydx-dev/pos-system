import { SheetQuery } from '@mydx-dev/gas-boost-runtime/core';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    ALL_TABLES,
    AllTableName,
} from '../../backend/infrastructure/database/tables';
import { userSchema } from '../../shared/schemas/database';
import { replicaQL } from '../lib/AppsScriptClient';

export const useFindUser = (
    query?: SheetQuery<typeof ALL_TABLES, typeof userSchema, AllTableName>
) => {
    return useLiveQuery(async () => {
        const users = await replicaQL.table('ユーザー').find(query);

        return users;
    }, [JSON.stringify(query)]);
};
