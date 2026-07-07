import { Button } from '@/components/ui/button';
import { Ban, HandCoins, RefreshCcw } from 'lucide-react';
import { RegisterOperation, formatCurrency } from './cashRegisterUtils';

export const CashRegisterTreatmentSummary = ({
    treatmentTotal,
    currentSales,
    canCancel,
    canRefund,
    hasSelectedTreatment,
    onStartOperation,
}: {
    treatmentTotal: number;
    currentSales: number;
    canCancel: boolean;
    canRefund: boolean;
    hasSelectedTreatment: boolean;
    onStartOperation: (operation: RegisterOperation) => void;
}) => (
    <section className="min-h-0 border-t-2 border-primary/20 bg-[#f7fafc] p-4 md:col-span-2">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_minmax(360px,520px)] xl:items-center">
            <div className="rounded-xl bg-white p-4 shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Total Amount Due
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <p className="text-4xl font-extrabold leading-none text-primary md:text-5xl">
                        {formatCurrency(treatmentTotal)}
                    </p>
                    <div className="min-w-40 space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                            <span className="text-on-surface-variant">
                                明細合計
                            </span>
                            <span className="font-bold">
                                {formatCurrency(treatmentTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-on-surface-variant">
                                現在売上
                            </span>
                            <span className="font-bold">
                                {formatCurrency(currentSales)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Button
                    className="h-14 gap-3 rounded-xl bg-primary-container text-base font-bold text-white hover:bg-primary/90 sm:h-16"
                    disabled={!hasSelectedTreatment || treatmentTotal <= 0}
                    onClick={() => onStartOperation('精算')}
                >
                    <HandCoins className="size-5" />
                    精算
                </Button>
                <Button
                    className="h-14 gap-2 rounded-xl bg-[#e5e9eb] text-base font-bold text-on-surface-variant hover:bg-[#e0e3e5]"
                    disabled={!hasSelectedTreatment || !canCancel}
                    onClick={() => onStartOperation('取消')}
                >
                    <Ban className="size-5" />
                    精算取消
                </Button>
                <Button
                    className="h-14 gap-2 rounded-xl bg-[#e5e9eb] text-base font-bold text-on-surface-variant hover:bg-[#e0e3e5]"
                    disabled={!hasSelectedTreatment || !canRefund}
                    onClick={() => onStartOperation('返金')}
                >
                    <RefreshCcw className="size-5" />
                    返金
                </Button>
            </div>
        </div>
    </section>
);
