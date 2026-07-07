export const PermissionBadge = ({
    label,
    has,
}: {
    label: string;
    has: boolean;
}) => {
    return (
        <div className="flex items-center gap-md p-sm border border-outline-variant rounded-lg">
            <span
                className={`material-symbols-outlined ${has ? 'text-emerald-600' : 'text-on-surface-variant'}`}
            >
                {has ? 'check_circle' : 'cancel'}
            </span>
            <span className="font-body-md text-body-md">{label}</span>
        </div>
    );
};
