import { ArrowRight, HelpCircle, Loader2, MonitorCheck } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../shared/routes';
import { useLoginRegisterTerminal } from '../hooks/useLoginRegisterTerminal';

const normalizePart = (value: string) =>
    value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);

export const RegisterTerminalLoginPage = () => {
    const [tokenParts, setTokenParts] = useState(['', '', '']);
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];
    const navigate = useNavigate();
    const { mutate: loginRegisterTerminal, isPending } =
        useLoginRegisterTerminal();

    const token = `RGT-${tokenParts.join('-')}`;
    const canSubmit = tokenParts.every((part) => part.length === 4);

    const updateTokenPart = (
        index: number,
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const value = normalizePart(event.target.value);
        setTokenParts((current) =>
            current.map((part, partIndex) =>
                partIndex === index ? value : part
            )
        );

        if (value.length === 4) {
            inputRefs[index + 1]?.current?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        event: KeyboardEvent<HTMLInputElement>
    ) => {
        if (
            event.key === 'Backspace' &&
            tokenParts[index].length === 0 &&
            index > 0
        ) {
            inputRefs[index - 1]?.current?.focus();
        }
    };

    const submit = () => {
        if (!canSubmit || isPending) return;

        loginRegisterTerminal(
            {
                token,
            },
            {
                onSuccess: () => {
                    navigate(routes.register.cashier);
                },
            }
        );
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-md text-on-surface">
            <section className="z-10 w-full max-w-[480px]">
                <div className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-xl shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-xl text-center">
                        <div className="mb-sm flex animate-[float_6s_ease-in-out_infinite] items-center justify-center gap-sm">
                            <MonitorCheck className="size-11 text-primary" />
                        </div>
                        <h1 className="mb-xs font-headline-lg text-headline-lg text-primary">
                            レジ端末認証
                        </h1>
                        <p className="text-body-md text-on-surface-variant">
                            サロンのセキュリティ維持のため、端末を認証してください
                        </p>
                    </div>

                    <form
                        className="flex w-full flex-col gap-lg"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        <div className="space-y-sm">
                            <label className="flex items-center justify-between gap-sm font-label-lg text-label-lg text-on-surface">
                                認証トークン
                                <span className="text-right text-label-md font-normal text-on-surface-variant">
                                    管理画面から発行できます
                                </span>
                            </label>
                            <div className="grid grid-cols-3 gap-sm md:gap-md">
                                {tokenParts.map((part, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        className="h-20 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-sm text-center font-mono text-2xl font-bold uppercase tracking-widest text-primary transition-all duration-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary md:h-24 md:text-3xl"
                                        maxLength={4}
                                        placeholder="XXXX"
                                        value={part}
                                        autoFocus={index === 0}
                                        onChange={(event) =>
                                            updateTokenPart(index, event)
                                        }
                                        onKeyDown={(event) =>
                                            handleKeyDown(index, event)
                                        }
                                    />
                                ))}
                            </div>
                            <p className="text-center font-mono text-label-md text-on-surface-variant">
                                RGT-{tokenParts[0] || 'XXXX'}-
                                {tokenParts[1] || 'XXXX'}-
                                {tokenParts[2] || 'XXXX'}
                            </p>
                        </div>

                        <button
                            className="group relative w-full overflow-hidden rounded-lg bg-primary-container py-lg font-label-lg text-label-lg text-on-primary shadow-sm transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                            disabled={!canSubmit || isPending}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-sm">
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-5 animate-spin" />
                                        認証中...
                                    </>
                                ) : (
                                    <>
                                        認証する
                                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </span>
                            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>

                        <div className="mt-md flex items-center justify-center gap-sm">
                            <HelpCircle className="size-4 text-on-surface-variant" />
                            <span className="text-body-sm text-on-surface-variant">
                                トークンを忘れた場合は管理者に再発行を依頼してください
                            </span>
                        </div>
                    </form>
                </div>

                <div className="mt-xl text-center">
                    <p className="text-label-md uppercase tracking-widest text-outline">
                        POS System
                    </p>
                    <div className="mt-sm flex items-center justify-center gap-sm">
                        <span className="size-2 rounded-full bg-success" />
                        <span className="text-body-sm text-on-surface-variant">
                            システム正常稼働中
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
};
