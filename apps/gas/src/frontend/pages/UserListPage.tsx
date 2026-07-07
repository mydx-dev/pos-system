import { UserCardList } from '@/components/user/UserCardList';
import { UserStatusFilter } from '@/components/user/UserStatusFilter';
import { UserTableList } from '@/components/user/UserTableList';
import { replicaQL } from '@/lib/AppsScriptClient';
import { useLiveQuery } from 'dexie-react-hooks';
import { UserNameFilter } from '../components/user/UserNameFilter';
import { useUserFilters } from '../hooks/useUserFilter';

export const UserListPage = () => {
    const { name, statuses } = useUserFilters();

    const users = useLiveQuery(() => {
        const query = replicaQL
            .query('ユーザー')
            .join('ID', 'ロール', 'ユーザーID');

        if (name) {
            query.and('氏名', '*', [name]);
        }

        if (statuses && statuses.length > 0) {
            query.and('承認', '=', statuses);
        } else {
            query.and('承認', '!=', [true, false]);
        }
        return replicaQL.table('ユーザー').find(query);
    }, [name, statuses]);

    return (
        <>
            {/* Search Section */}
            <div className="mb-8">
                <UserNameFilter />
                <UserStatusFilter />
            </div>
            {/* User List (Asymmetric Layout) */}
            <UserCardList users={users || []} />
            {/* User List (Table Layout) */}
            <UserTableList users={users || []} />
        </>
    );
};
