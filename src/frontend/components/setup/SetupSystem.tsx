import { useInitialize } from '@/hooks/useInitialize';
import { server } from '@/lib/AppsScriptClient';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SetupTask, Task } from './SetupTask';

export const SetupSystem = () => {
    const { isSetupCompleted, scriptId } = useInitialize();
    const [isGASChecked, setIsGASChecked] = useState(isSetupCompleted);
    const [isPasswordResetChecked, setIsPasswordResetChecked] =
        useState(isSetupCompleted);
    const isAllChecked = isGASChecked && isPasswordResetChecked;
    const [isAllCompleted, setIsAllCompleted] = useState(false);
    const { isLoading } = useQuery({
        queryKey: ['checkSetupStatus'],
        queryFn: async () => {
            const toastId = toast.loading(
                '初期化が完了しているか確認しています...'
            );

            try {
                const res = await server.isSetupCompleted();
                setIsAllCompleted(res);

                if (!res) {
                    toast.error(
                        'GASの実行が完了していません。タスクを確認してください。'
                    );

                    setIsGASChecked(false);
                    setIsPasswordResetChecked(false);
                }

                return res;
            } finally {
                toast.dismiss(toastId);
            }
        },

        enabled: isAllChecked,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    const tasks: Task[] = [
        {
            title: '初期化プログラムの実行',
            description: (
                <>
                    Google Apps Scriptを開き、
                    <code className="px-1.5 py-0.5 bg-secondary-container text-primary rounded font-mono text-xs">
                        'setupSystem'
                    </code>{' '}
                    関数を実行してください。
                </>
            ),
            moreInfo: (
                <>
                    <div className="mt-4 flex flex-col gap-3">
                        <a
                            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline group-hover:translate-x-1 transition-transform"
                            href={`https://script.google.com/u/0/home/projects/${scriptId}/edit`}
                            target="_blank"
                        >
                            GASを開く
                            <span className="material-symbols-outlined text-xs">
                                open_in_new
                            </span>
                        </a>
                        <div className="flex gap-2 p-3 bg-error-container/20 rounded-lg">
                            <span className="material-symbols-outlined text-error text-sm">
                                info
                            </span>
                            <p className="text-[11px] text-on-error-container leading-tight">
                                この画面が開けない場合は、GASのアクセス権限がありません。システム管理者に連絡してください。
                            </p>
                        </div>
                    </div>
                </>
            ),
            onComplete: () => {
                setIsGASChecked((prev) => !prev);
            },
            checked: isGASChecked,
        },
        {
            title: 'パスワードリセット',
            description: (
                <>
                    管理者アドレス宛に送信された初期ユーザーのパスワードリセットを完了させてください。
                </>
            ),
            onComplete: () => {
                setIsPasswordResetChecked((prev) => !prev);
            },
            checked: isPasswordResetChecked,
        },
    ];

    return (
        <>
            <div className="flex-grow flex flex-col items-center justify-center p-6 lg:p-12">
                {/* Stepper Container */}

                {/* Task Card Container */}
                <div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px] relative">
                    {/* Right: Interaction Area (Task List) */}
                    <div className="p-8 lg:p-10 flex flex-col">
                        <div className="space-y-6 flex-grow">
                            {tasks.map((task, index) => {
                                return <SetupTask key={index} task={task} />;
                            })}
                        </div>
                        {/* Action Area */}
                        <div className="mt-12 pt-8 border-t border-outline-variant/30">
                            <button
                                className={
                                    'w-full h-14 bg-surface-container-highest text-outline font-bold rounded-xl flex items-center justify-center gap-3 transition-all duration-500 shadow-sm' +
                                    (!isAllChecked ? ' cursor-not-allowed' : '')
                                }
                                disabled={!isAllCompleted}
                                id="finish-btn"
                            >
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : null}
                                <span>利用規約に進む</span>
                                <span className="material-symbols-outlined">
                                    arrow_forward
                                </span>
                            </button>
                            <p className="text-center mt-4 text-[10px] text-on-surface-variant font-medium uppercase tracking-tighter opacity-60">
                                すべてのタスクを完了する必要があります
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
