import { ALL_TABLES } from '@/../backend/infrastructure/database/tables';
import { employeeSchema } from '@mydx-pos/shared/schemas/database';
import { replicaQL } from '@/lib/AppsScriptClient';
import { SheetQuery } from '@mydx-dev/gas-boost-runtime/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { Employee } from '@mydx-pos/shared/domain/entity/Employee';

export const useFindEmployee = (
    query: SheetQuery<typeof ALL_TABLES, typeof employeeSchema>
) => {
    return useLiveQuery(async () => {
        const result = await replicaQL.table('スタッフ').find(query);
        return result as Employee[];
    }, [query]);
};
