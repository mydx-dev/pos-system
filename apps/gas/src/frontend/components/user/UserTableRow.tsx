import { useNavigate } from 'react-router-dom';
import { User } from '../../../shared/domain/entity/User';
import { routes } from '../../../shared/routes';
import { UserActionMenu } from './UserActionMenu';
import { UserApprovedBadge } from './UserApprovedBadge';

export const UserTableRow = ({ user }: { user: User }) => {
    const navigate = useNavigate();

    return (
        <tr
            className="hover:bg-surface-container-low transition-all group"
            onClick={() => navigate(routes.user.detail.build(user.id))}
        >
            <td className="px-8 py-3">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-semibold text-on-surface">
                            {user.name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                            {user.email}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-8  font-mono text-sm text-on-surface-variant">
                {user.id}
            </td>
            <td className="px-8">
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-[10px] font-bold uppercase tracking-tight">
                        {user.role[0]}
                    </span>
                    {user.role.length > 1 && (
                        <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                            +{user.role.length - 1}
                            <span className="material-symbols-outlined text-[12px]">
                                expand_more
                            </span>
                        </span>
                    )}
                </div>
            </td>
            <td className="px-8">
                <UserApprovedBadge isApproved={user.approval} />
            </td>
            <td
                className="px-8 text-right"
                onClick={(e) => e.stopPropagation()}
            >
                <UserActionMenu user={user} />
            </td>
        </tr>
    );
};
