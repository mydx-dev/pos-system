import { Customer } from '@/../shared/domain/entity/Customer';
import { Treatment } from '@/../shared/domain/entity/Treatment';
import { TreatmentMenu } from '@/../shared/domain/entity/TreatmentMenu';
import { Search } from 'lucide-react';
import { formatCurrency, inputClassName, timeText } from './cashRegisterUtils';

export type CashRegisterStatusFilter =
    | 'all'
    | '来店済み'
    | '予約済み'
    | '精算済み';

export const CashRegisterTreatmentList = ({
    date,
    search,
    status,
    rows,
    selectedTreatment,
    employeeNameById,
    onDateChange,
    onSearchChange,
    onStatusChange,
    onTreatmentSelect,
}: {
    date: string;
    search: string;
    status: CashRegisterStatusFilter;
    rows: Treatment[];
    selectedTreatment: Treatment | null;
    employeeNameById: Map<string, string>;
    onDateChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: CashRegisterStatusFilter) => void;
    onTreatmentSelect: (id: string) => void;
}) => (
    <aside className="flex min-h-0 flex-col border-b border-[#c6c6cc] bg-[#f7fafc] md:border-b-0 md:border-r">
        <div className="border-b border-[#c6c6cc] bg-white p-4">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                        日付
                    </label>
                    <input
                        className={inputClassName}
                        type="date"
                        value={date}
                        onChange={(event) => onDateChange(event.target.value)}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-on-surface-variant">
                        顧客名
                    </label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                        <input
                            className={`${inputClassName} pl-9`}
                            value={search}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {[
                    ['来店済み', '来店済み'],
                    ['予約中', '予約済み'],
                    ['精算済み', '精算済み'],
                    ['すべて', 'all'],
                ].map(([label, value]) => (
                    <button
                        key={value}
                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                            status === value
                                ? 'bg-primary-container text-white'
                                : 'bg-[#ebeef0] text-on-surface-variant hover:bg-[#e0e3e5]'
                        }`}
                        type="button"
                        onClick={() =>
                            onStatusChange(value as CashRegisterStatusFilter)
                        }
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f1f4f6] p-4">
            {rows.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#c6c6cc] bg-white p-6 text-center text-sm text-on-surface-variant">
                    対象の施術はありません
                </div>
            )}
            {rows.map((treatment) => {
                const rowCustomer = treatment.getRelation(Customer)[0];
                const rowMenus = treatment.getRelation(TreatmentMenu);
                const rowTotal = rowMenus.reduce(
                    (sum, menu) =>
                        sum +
                        menu.quantity *
                            Math.max(
                                0,
                                menu.regularPrice - menu.discountAmount
                            ),
                    0
                );
                const selected = treatment.id === selectedTreatment?.id;

                return (
                    <button
                        key={treatment.id}
                        className={`w-full rounded-xl border-l-4 bg-white p-4 text-left shadow-[0_4px_12px_rgba(26,32,44,0.05)] ring-1 ring-black/5 transition-colors hover:bg-[#f7fafc] ${
                            selected ? 'border-primary' : 'border-[#c1c7cf]'
                        }`}
                        type="button"
                        onClick={() => onTreatmentSelect(treatment.id)}
                    >
                        <div className="mb-2 flex items-start justify-between gap-2">
                            <span className="text-base font-bold text-primary">
                                {rowCustomer?.name ?? '顧客未設定'} 様
                            </span>
                            <span className="rounded bg-[#1a202c] px-2 py-0.5 text-[10px] font-bold text-white">
                                {treatment.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-1 text-sm text-on-surface-variant">
                            <span>
                                担当:{' '}
                                {employeeNameById.get(treatment.staffId) ?? '-'}
                            </span>
                            <span className="text-right">
                                {timeText(treatment.startAt)}
                            </span>
                            <span className="truncate">
                                {rowMenus[0]?.menuName ?? '明細なし'}
                            </span>
                            <span className="text-right font-bold text-primary">
                                {formatCurrency(rowTotal)}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    </aside>
);
