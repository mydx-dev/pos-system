import { useDeleteUser } from '@/hooks/useDeleteUser';

export const EmployeeDeleteDialog = ({
    isOpen,
    onClose,
    name,
    id,
}: {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    id: string;
}) => {
    const { mutate, isPending } = useDeleteUser();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 transition-opacity"></div>
            {/* Modal Content */}
            <div className="relative bg-surface-container-lowest w-full max-w-[32rem] rounded-xl shadow-2xl p-lg space-y-lg">
                <div className="flex items-center gap-md text-error">
                    <span className="material-symbols-outlined text-headline-lg">
                        warning
                    </span>
                    <h3 className="font-headline-md text-headline-md text-primary">
                        スタッフの削除
                    </h3>
                </div>
                <div className="space-y-md">
                    <p className="text-body-md text-on-surface">
                        <span className="font-bold">{name}</span>
                        さんを削除してもよろしいですか？
                    </p>
                    <p className="text-body-sm text-on-surface-variant bg-surface-container-low p-md rounded-lg border-l-4 border-outline">
                        この操作は取り消せません。また、システム管理者権限を持つユーザーのみが実行可能です。
                    </p>
                </div>
                <div className="flex gap-md pt-md">
                    <button
                        className="flex-1 py-md border border-outline-variant rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        onClick={onClose}
                    >
                        キャンセル
                    </button>
                    <button
                        className="flex-1 py-md bg-error text-on-error rounded-lg font-label-lg shadow-md hover:opacity-90 transition-all active:scale-95"
                        onClick={() => {
                            mutate(
                                { userId: id },
                                {
                                    onSuccess: () => {
                                        onClose();
                                    },
                                }
                            );
                        }}
                        disabled={isPending}
                    >
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
};
