import { AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateRegisterTerminalResponse } from '@mydx-pos/shared/api/registerTerminal';

type RegisterTerminalRegistrationCompleteModalProps = {
    result: CreateRegisterTerminalResponse & {
        requestedName: string;
    };
    onClose: () => void;
};

export const RegisterTerminalRegistrationCompleteModal = ({
    result,
    onClose,
}: RegisterTerminalRegistrationCompleteModalProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToken = async () => {
        try {
            await navigator.clipboard.writeText(result.plainToken);
            setIsCopied(true);
            toast.success('トークンをコピーしました');
            window.setTimeout(() => setIsCopied(false), 2000);
        } catch {
            toast.error('トークンをコピーできませんでした');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-md backdrop-blur-sm">
            <section className="w-full max-w-[700px] overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl">
                <div className="p-xl text-center">
                    <div className="mx-auto mb-lg flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                        <CheckCircle2 className="size-8" />
                    </div>
                    <h3 className="mb-sm font-headline-lg text-headline-lg text-primary">
                        端末登録完了
                    </h3>
                    <p className="mb-xl text-body-md text-on-surface-variant">
                        {result.requestedName}
                        の登録が完了しました。以下の認証トークンを端末側に入力してください。
                    </p>

                    <div className="mb-md rounded-xl border border-outline-variant bg-gradient-to-br from-white to-surface-container-low p-lg shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                        <p className="mb-sm text-label-md font-bold uppercase tracking-widest text-on-surface-variant">
                            Registration Token
                        </p>
                        <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                            <span className="select-all break-all font-mono text-2xl font-bold text-primary md:text-4xl">
                                {result.plainToken}
                            </span>
                            <button
                                className="flex h-11 items-center justify-center gap-sm rounded-lg bg-primary-container px-md text-on-primary transition-all hover:bg-primary active:scale-95"
                                onClick={copyToken}
                            >
                                {isCopied ? (
                                    <CheckCircle2 className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                                <span className="font-label-lg text-label-lg">
                                    {isCopied ? 'コピー済み' : 'コピー'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-lg flex items-start gap-md rounded-lg border border-error/20 bg-error-container p-md text-left text-on-error-container">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-error" />
                        <p className="text-body-sm font-medium leading-relaxed">
                            このトークンは一度しか表示されません。必ずコピーして端末側に入力してください。
                        </p>
                    </div>

                    <button
                        className="h-11 w-full rounded-lg border border-outline-variant font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-low active:scale-[0.98]"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </section>
        </div>
    );
};
