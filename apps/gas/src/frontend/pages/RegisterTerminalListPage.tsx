import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CreateRegisterTerminalResponse } from '@mydx-pos/shared/api/registerTerminal';
import { RegisterTerminalCard } from '../components/registerTerminal/RegisterTerminalCard';
import { RegisterTerminalRegistrationCompleteModal } from '../components/registerTerminal/RegisterTerminalRegistrationCompleteModal';
import { useCreateRegisterTerminal } from '../hooks/useCreateRegisterTerminal';

const registerTerminalFormSchema = z.object({
    端末名: z.string().min(1, '端末名は必須です'),
});

type RegisterTerminalForm = z.infer<typeof registerTerminalFormSchema>;

type RegisteredTerminal = CreateRegisterTerminalResponse & {
    requestedName: string;
};

export const RegisterTerminalListPage = () => {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registeredTerminals, setRegisteredTerminals] = useState<
        RegisteredTerminal[]
    >([]);
    const [registrationResult, setRegistrationResult] =
        useState<RegisteredTerminal | null>(null);
    const { mutate: createRegisterTerminal, isPending } =
        useCreateRegisterTerminal();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<RegisterTerminalForm>({
        resolver: zodResolver(registerTerminalFormSchema),
        mode: 'onChange',
        defaultValues: {
            端末名: '',
        },
    });

    const terminals = useMemo(
        () => [
            ...registeredTerminals.map((terminal) => ({
                name: terminal.registerTerminal.端末名,
                enabled: terminal.registerTerminal.有効,
                issuedAt: terminal.registerTerminal.発行日時,
                lastUsedAt: terminal.registerTerminal.最終利用日時,
                deviceType: 'desktop' as const,
            })),
        ],
        [registeredTerminals]
    );

    const closeRegisterModal = () => {
        if (isPending) return;
        setIsRegisterModalOpen(false);
    };

    const submit = (data: RegisterTerminalForm) => {
        createRegisterTerminal(
            {
                端末名: data.端末名,
            },
            {
                onSuccess: (response) => {
                    const result = {
                        ...response,
                        requestedName: data.端末名,
                    };
                    setRegisteredTerminals((current) => [result, ...current]);
                    setRegistrationResult(result);
                    setIsRegisterModalOpen(false);
                    reset();
                },
            }
        );
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-container-max flex-col gap-xl px-md pb-32 pt-lg md:px-xl">
            <section className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="font-headline-lg text-headline-lg tracking-tight text-primary">
                        レジ端末一覧
                    </h2>
                    <p className="mt-xs text-body-md text-on-surface-variant">
                        システムに登録されているレジ端末を管理できます。
                    </p>
                </div>
                <button
                    className="flex h-11 items-center justify-center gap-sm rounded-lg bg-primary-container px-lg text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
                    onClick={() => setIsRegisterModalOpen(true)}
                >
                    <Plus className="size-4" />
                    <span className="font-label-lg text-label-lg">
                        新規登録
                    </span>
                </button>
            </section>

            <section className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
                {terminals.map((terminal) => (
                    <RegisterTerminalCard
                        key={`${terminal.name}-${terminal.issuedAt}`}
                        {...terminal}
                    />
                ))}
                <button
                    className="flex min-h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant p-lg text-on-surface-variant transition-all hover:border-primary hover:text-primary active:scale-[0.99]"
                    onClick={() => setIsRegisterModalOpen(true)}
                >
                    <div className="mb-md flex size-12 items-center justify-center rounded-full border-2 border-dashed border-outline-variant">
                        <Plus className="size-7" />
                    </div>
                    <p className="font-label-lg text-label-lg">新規端末登録</p>
                    <p className="mt-xs text-body-sm opacity-60">
                        端末名を入力して登録します
                    </p>
                </button>
            </section>

            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-md backdrop-blur-sm">
                    <form
                        className="w-full max-w-[500px] overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl"
                        onSubmit={handleSubmit(submit)}
                    >
                        <div className="flex items-center justify-between border-b border-outline-variant px-lg py-md">
                            <h3 className="font-headline-md text-headline-md text-primary">
                                新規端末登録
                            </h3>
                            <button
                                type="button"
                                className="flex size-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
                                onClick={closeRegisterModal}
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-lg">
                            <p className="mb-lg text-body-sm text-on-surface-variant">
                                管理画面で識別する端末名を入力してください。
                            </p>
                            <div className="space-y-xs">
                                <label
                                    className="block text-label-lg text-primary"
                                    htmlFor="register-terminal-name"
                                >
                                    端末名
                                </label>
                                <input
                                    id="register-terminal-name"
                                    className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="例：受付PC、バックヤードiPad"
                                    autoFocus
                                    {...register('端末名')}
                                />
                                {errors.端末名 && (
                                    <p className="text-label-md text-error">
                                        {errors.端末名.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-md bg-surface-container-low px-lg py-md">
                            <button
                                type="button"
                                className="h-10 rounded-lg px-lg font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-variant"
                                onClick={closeRegisterModal}
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="h-10 rounded-lg bg-primary-container px-xl font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!isValid || isPending}
                            >
                                {isPending ? '登録中...' : '登録する'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {registrationResult && (
                <RegisterTerminalRegistrationCompleteModal
                    result={registrationResult}
                    onClose={() => setRegistrationResult(null)}
                />
            )}
        </div>
    );
};
