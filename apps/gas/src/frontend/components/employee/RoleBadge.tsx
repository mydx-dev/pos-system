import { RoleName } from '@/../shared/domain/entity/Role';

export const RoleBadge: React.FC<{ role: RoleName }> = ({ role }) => {
    if (role === 'システム管理者') {
        return (
            <div className="flex items-center gap-xs text-primary px-sm py-xs bg-secondary-fixed w-fit rounded-full">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-label-md font-label-md">{role}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-xs text-on-surface-variant px-sm py-xs bg-surface-container-high w-fit rounded-full">
            <span className="w-2 h-2 rounded-full bg-outline"></span>
            <span className="text-label-md font-label-md">{role}</span>
        </div>
    );
};
