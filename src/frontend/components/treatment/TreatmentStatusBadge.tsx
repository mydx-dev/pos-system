type TreatmentStatusBadgeProps = {
    status: '予約済み' | '進行中' | '完了';
};

export const TreatmentStatusBadge = ({ status }: TreatmentStatusBadgeProps) => {
    if (status === '予約済み') {
        <span className="bg-primary-fixed text-on-primary-fixed px-md py-xs rounded-full font-label-md text-label-md">
            予約済み
        </span>;
    }

    if (status === '進行中') {
        return (
            <span className="bg-sky-100 text-sky-800 px-md py-xs rounded-full font-label-md text-label-md">
                進行中
            </span>
        );
    }

    if (status === '完了') {
        return (
            <span className="bg-emerald-100 text-emerald-800 px-md py-xs rounded-full font-label-md text-label-md">
                完了
            </span>
        );
    }
};
