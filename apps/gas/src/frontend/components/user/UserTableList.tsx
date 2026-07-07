import { User } from '../../../shared/domain/entity/User';
import { UserTableRow } from './UserTableRow';

export const UserTableList = ({ users }: { users: User[] }) => {
    return (
        <table className="w-full text-left border-collapse hidden md:table">
            <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant border-opacity-10">
                    <th className="px-8 py-5 font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        氏名/メールアドレス
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        ユーザーID
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        権限
                    </th>
                    <th className="px-8 py-5 font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        承認
                    </th>
                    <th className="px-8 py-5 text-right font-headline text-xs font-bold text-on-surface-variant uppercase tracking-widest"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
                {users.map((user) => (
                    <UserTableRow key={user.id} user={user} />
                ))}
            </tbody>
        </table>
    );
};
