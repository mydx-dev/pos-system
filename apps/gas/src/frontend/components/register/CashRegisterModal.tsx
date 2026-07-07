import { PaymentRecordType } from '@/../shared/domain/entity/PaymentRecord';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
    dateTimeText,
    formatCurrency,
    inputClassName,
    numberValue,
    operationLabel,
} from './cashRegisterUtils';

export const CashRegisterModal = ({
    operation,
    amount,
    paidAmount,
    note,
    isPending,
    onAmountChange,
    onPaidAmountChange,
    onNoteChange,
    onClose,
    onSubmit,
}: {
    operation: PaymentRecordType;
    amount: number;
    paidAmount: number;
    note: string;
    isPending: boolean;
    onAmountChange: (value: number) => void;
    onPaidAmountChange: (value: number) => void;
    onNoteChange: (value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) => {
    const isSettlement = operation === '精算';
    const canSubmit =
        amount > 0 && (!isSettlement || paidAmount >= amount) && !isPending;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
            <div className="grid h-[88vh] w-full max-w-[860px] overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl md:grid-cols-[1fr_360px]">
                <section className="overflow-hidden bg-surface-container-low p-lg">
                    <div className="mx-auto max-w-[360px] rounded-xl border border-outline-variant bg-white p-lg shadow-sm">
                        <div className="mb-lg text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                                SalonPOS
                            </p>
                            <h3 className="mt-1 text-xl font-bold text-primary">
                                {operationLabel[operation]}
                            </h3>
                        </div>
                        <div className="space-y-2 border-y border-dashed border-outline-variant py-md text-sm">
                            <div className="flex justify-between">
                                <span>支払方法</span>
                                <span className="font-bold">現金</span>
                            </div>
                            <div className="flex justify-between">
                                <span>発生日時</span>
                                <span>
                                    {dateTimeText(new Date().toISOString())}
                                </span>
                            </div>
                        </div>
                        <div className="mt-lg flex justify-between text-lg font-bold">
                            <span>金額</span>
                            <span>{formatCurrency(amount)}</span>
                        </div>
                    </div>
                </section>

                <section className="flex h-full min-h-0 flex-col overflow-hidden border-l border-outline-variant p-md">
                    <div className="flex min-h-0 flex-1 flex-col gap-lg overflow-hidden">
                        <div className="shrink-0">
                            <h2 className="text-xl font-bold leading-tight text-primary">
                                {operationLabel[operation]}
                            </h2>
                        </div>
                        <div className="flex h-24 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-container p-sm">
                            <p className="mb-1 text-sm font-bold text-on-primary-container">
                                ご請求金額
                            </p>
                            <p className="text-3xl font-extrabold leading-none text-white">
                                {formatCurrency(amount)}
                            </p>
                        </div>
                        {operation === '返金' && (
                            <div className="shrink-0">
                                <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                                    返金額
                                </label>
                                <input
                                    className={inputClassName}
                                    min={1}
                                    type="number"
                                    value={amount}
                                    onChange={(event) =>
                                        onAmountChange(
                                            Math.max(
                                                0,
                                                numberValue(event.target.value)
                                            )
                                        )
                                    }
                                />
                            </div>
                        )}
                        {isSettlement && (
                            <div className="shrink-0 space-y-3">
                                <label className="block text-xs font-bold text-on-surface-variant">
                                    お預かり金額
                                    <input
                                        className={`${inputClassName} mt-1 h-14 text-right text-2xl font-extrabold`}
                                        inputMode="numeric"
                                        min={0}
                                        type="number"
                                        value={paidAmount || ''}
                                        onChange={(event) =>
                                            onPaidAmountChange(
                                                Math.max(
                                                    0,
                                                    numberValue(
                                                        event.target.value
                                                    )
                                                )
                                            )
                                        }
                                    />
                                </label>
                                <div className="flex h-12 items-center justify-between border-t border-outline-variant">
                                    <span className="font-bold text-on-surface-variant">
                                        お釣り
                                    </span>
                                    <span className="text-2xl font-extrabold text-primary">
                                        {formatCurrency(
                                            Math.max(0, paidAmount - amount)
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex h-12 shrink-0 items-center gap-sm rounded-lg bg-secondary-container/30 px-sm text-on-secondary-container">
                            <span className="material-symbols-outlined text-2xl">
                                payments
                            </span>
                            <div>
                                <p className="text-sm font-bold">
                                    支払方法: 現金
                                </p>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1">
                            <label className="mb-1 block text-xs font-bold text-on-surface-variant">
                                備考
                            </label>
                            <textarea
                                className="h-[calc(100%-5rem)] min-h-6 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                value={note}
                                onChange={(event) =>
                                    onNoteChange(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-sm shrink-0 space-y-1 border-t border-outline-variant pt-sm">
                        <Button
                            className="h-11 w-full gap-sm rounded-xl bg-primary-container text-base font-bold text-white hover:bg-primary-container/90"
                            disabled={!canSubmit}
                            onClick={onSubmit}
                        >
                            {isPending ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-5" />
                            )}
                            確定する
                        </Button>
                        <button
                            className="h-9 w-full rounded-xl text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
                            type="button"
                            onClick={onClose}
                        >
                            戻る
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
