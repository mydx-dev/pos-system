import { User } from '@/../shared/domain/entity/User';
import { replica, replicaQL, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import Dexie from 'dexie';
import { toast } from 'sonner';

type SyncRecord = Record<string, unknown>;
const isSyncRecord = (value: unknown): value is SyncRecord =>
    typeof value === 'object' && value !== null;
const getRecordId = (record: SyncRecord, primaryKeyName: string): unknown =>
    record[primaryKeyName];

async function mergeDatabase(
    remoteDatabase: Awaited<ReturnType<typeof server.pullDatabase>>
) {
    for (const { table, records } of remoteDatabase) {
        const localTable = replica[table.name] as Dexie.Table<
            SyncRecord,
            unknown
        >;

        const primaryKeyName =
            typeof table.primaryKey === 'string' ? table.primaryKey : 'id';

        const localRecords = await localTable.toArray();

        const localRecordIds = localRecords.map((record) =>
            getRecordId(record, primaryKeyName)
        );

        const remoteRecords = records.filter(isSyncRecord);

        const remoteRecordIds = remoteRecords.map((record) =>
            getRecordId(record, primaryKeyName)
        );

        const recordsToDelete = localRecordIds.filter(
            (id) => !remoteRecordIds.includes(id)
        );

        await replica.transaction('rw', localTable, async () => {
            if (remoteRecords.length) {
                await localTable.bulkPut(remoteRecords);
            }

            if (recordsToDelete.length) {
                await localTable.bulkDelete(recordsToDelete);
            }
        });
    }
}

export const useSyncDatabase = ({
    userId,
    syncUser,
}: {
    userId: string | null;
    syncUser: (user: User) => void;
}) => {
    return useMutation({
        mutationFn: async (sessionToken: string) => {
            const database = await server.pullDatabase({ sessionToken });
            await mergeDatabase(database);
        },

        onSuccess: async () => {
            toast.success('データの同期が完了しました');

            const userData = await replicaQL
                .table('ユーザー')
                .find(
                    replicaQL
                        .query('ユーザー')
                        .and('ID', '=', [userId!])
                        .join('ID', 'ロール', 'ユーザーID')
                );

            if (userData) {
                syncUser(userData[0]);
            }
        },

        onError: () => {
            toast.error('データの同期に失敗しました');
        },
    });
};
