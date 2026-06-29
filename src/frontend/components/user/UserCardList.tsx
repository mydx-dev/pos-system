import { User } from '@/../shared/domain/entity/User';
import { UserCard } from './UserCard';

export const UserCardList = ({ users }: { users: User[] }) => {
    return (
        <div className="space-y-6 block md:hidden">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
};
