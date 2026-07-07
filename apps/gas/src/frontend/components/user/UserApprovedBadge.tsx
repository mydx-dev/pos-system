export const UserApprovedBadge = ({ isApproved }: { isApproved: boolean }) => {
    return isApproved ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed-variant"></span>
            承認済み
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
            未承認
        </span>
    );
};
