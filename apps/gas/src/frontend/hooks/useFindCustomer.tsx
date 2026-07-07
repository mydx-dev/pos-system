import { SheetQuery } from '@mydx-dev/gas-boost-runtime/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { Customer } from '@mydx-pos/shared/domain/entity/Customer';
import { customerSchema } from '@mydx-pos/shared/schemas/database';
import { replicaQL } from '../lib/AppsScriptClient';

export const useFindCustomer = (
    query: SheetQuery<
        typeof ALL_TABLES,
        typeof customerSchema
    > = new SheetQuery()
) => {
    return useLiveQuery(async () => {
        const result = await replicaQL.table('顧客').find(query);
        return result as Customer[];
    }, [JSON.stringify(query)]);
};
