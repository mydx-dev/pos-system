import { User } from '@/../shared/domain/entity/User';
import { routes } from '@/../shared/routes';
import { useNavigate } from 'react-router-dom';
import { UserActionMenu } from './UserActionMenu';
import { UserApprovedBadge } from './UserApprovedBadge';

export const UserCard = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-surface-container-lowest rounded-xl p-5 group hover:bg-surface-container-low transition-all duration-300"
            onClick={() => navigate(routes.user.detail.build(user.id))}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-primary">
                            {user.name}
                        </h3>
                        <span className="font-['Inter'] text-[11px] font-medium text-outline">
                            ID: {user.id}
                        </span>
                    </div>
                </div>
                <UserApprovedBadge isApproved={user.approval} />
                <UserActionMenu user={user} />
            </div>
            <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-outline text-sm">
                    mail
                </span>
                <span className="text-body-sm text-on-surface-variant font-medium">
                    {user.email}
                </span>
            </div>
            <div className="space-y-3">
                <label className="font-['Inter'] font-semibold text-[10px] uppercase tracking-wider text-outline block">
                    権限設定
                </label>
                <div className="flex flex-wrap gap-2">
                    {user.role.map((role) => (
                        <span
                            key={role}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-semibold"
                        >
                            {role}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
