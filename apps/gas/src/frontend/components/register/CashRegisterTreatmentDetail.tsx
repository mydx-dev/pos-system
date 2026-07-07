import { PaymentRecord } from '@mydx-pos/shared/domain/entity/PaymentRecord';
import { Treatment } from '@mydx-pos/shared/domain/entity/Treatment';
import { TreatmentMenu } from '@mydx-pos/shared/domain/entity/TreatmentMenu';
import { Button } from '@/components/ui/button';
import { Printer, Settings } from 'lucide-react';
import { dateTimeText, formatCurrency, timeText } from './cashRegisterUtils';

export const CashRegisterTreatmentDetail = ({
    selectedTreatment,
    customerName,
    staffName,
    menus,
    paymentRecords,
    isPrinterPrinting,
    onOpenPrinterConfig,
    onReprintRecord,
}: {
    selectedTreatment: Treatment | null;
    customerName: string | null;
    staffName: string | null;
    menus: TreatmentMenu[];
    paymentRecords: PaymentRecord[];
    isPrinterPrinting: boolean;
    onOpenPrinterConfig: () => void;
    onReprintRecord: (record: PaymentRecord) => void;
}) => (
    <section className="flex min-h-0 flex-col overflow-hidden bg-white">
        {selectedTreatment ? (
            <>
                <div className="border-b border-[#c6c6cc] bg-white p-5">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-3xl font-extrabold text-primary">
                                    {customerName ?? '顧客未設定'} 様
                                </h2>
                                <span className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-white">
                                    {selectedTreatment.status}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-on-surface-variant">
                                担当: {staffName ?? '-'}{' '}
                                <span className="mx-2">|</span>
                                来店日時:{' '}
                                {dateTimeText(selectedTreatment.startAt)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                className="h-10 gap-2 rounded-lg"
                                variant="outline"
                                onClick={onOpenPrinterConfig}
                            >
                                <Settings className="size-4" />
                                プリンター設定
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-primary">
                            メニュー明細
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[680px] text-left">
                            <thead className="border-b border-[#c6c6cc] bg-[#f7fafc] text-xs font-bold text-on-surface-variant">
                                <tr>
                                    <th className="px-3 py-3">メニュー名</th>
                                    <th className="w-20 px-3 py-3 text-center">
                                        数量
                                    </th>
                                    <th className="w-28 px-3 py-3 text-right">
                                        単価
                                    </th>
                                    <th className="w-28 px-3 py-3 text-right">
                                        値引き
                                    </th>
                                    <th className="w-32 px-3 py-3 text-right">
                                        小計
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {menus.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-3 py-8 text-center text-on-surface-variant"
                                            colSpan={5}
                                        >
                                            明細なし
                                        </td>
                                    </tr>
                                )}
                                {menus.map((menu) => {
                                    const subtotal =
                                        menu.quantity *
                                        Math.max(
                                            0,
                                            menu.regularPrice -
                                                menu.discountAmount
                                        );
                                    return (
                                        <tr
                                            key={menu.id}
                                            className="border-b border-[#e0e3e5]"
                                        >
                                            <td className="px-3 py-4 font-bold">
                                                {menu.menuName}
                                            </td>
                                            <td className="px-3 py-4 text-center">
                                                {menu.quantity}
                                            </td>
                                            <td className="px-3 py-4 text-right">
                                                {formatCurrency(
                                                    menu.regularPrice
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-right">
                                                {formatCurrency(
                                                    menu.discountAmount
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-right font-bold">
                                                {formatCurrency(subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-3 text-xl font-bold text-primary">
                            精算履歴
                        </h3>
                        <div className="space-y-2">
                            {paymentRecords.length === 0 && (
                                <div className="rounded-lg bg-[#f1f4f6] px-4 py-3 text-sm text-on-surface-variant">
                                    履歴なし
                                </div>
                            )}
                            {paymentRecords.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center gap-3 rounded-lg bg-[#f1f4f6] px-4 py-3 text-sm"
                                >
                                    <span
                                        className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${
                                            record.isPaid
                                                ? 'bg-primary'
                                                : 'bg-on-surface-variant'
                                        }`}
                                    >
                                        {record.type}
                                    </span>
                                    <span className="text-on-surface-variant">
                                        {timeText(record.occurredAt)}
                                    </span>
                                    <span className="flex-1 truncate">
                                        {record.note || '現金'}
                                    </span>
                                    <span className="font-bold">
                                        {record.isPaid ? '+' : '-'}
                                        {formatCurrency(record.amount)}
                                    </span>
                                    {record.isPaid && (
                                        <Button
                                            className="h-8 gap-1 rounded-lg px-2 text-xs"
                                            disabled={isPrinterPrinting}
                                            variant="outline"
                                            onClick={() =>
                                                onReprintRecord(record)
                                            }
                                        >
                                            <Printer className="size-3.5" />
                                            再出力
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex flex-1 items-center justify-center text-on-surface-variant">
                施術を選択してください
            </div>
        )}
    </section>
);
