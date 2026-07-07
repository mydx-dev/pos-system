import { TreatmentStatus } from '@mydx-pos/shared/domain/entity/Treatment';
import { CustomerCombobox } from '@/components/customer/CustomerCombobox';
import { StaffCombobox } from '@/components/employee/StaffCombobox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTreatment } from '@/hooks/useCreateTreatment';
import { useFindCustomer } from '@/hooks/useFindCustomer';
import { useFindEmployee } from '@/hooks/useFindEmployee';
import { useFindMenu } from '@/hooks/useFindMenu';
import { useFindMenuCategory } from '@/hooks/useFindMenuCategory';
import { replicaQL } from '@/lib/AppsScriptClient';
import {
    ArrowLeft,
    ChevronDown,
    ClipboardList,
    Clock3,
    FileText,
    Loader2,
    Plus,
    Save,
    Scissors,
    Search,
    Trash2,
    UserRound,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

type SelectedMenu = {
    menuId: string;
    quantity: number;
    discountAmount: number;
};

const fieldClassName =
    'h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClassName =
    'mb-xs block font-label-md text-label-md text-on-surface-variant';

const durationOptions = Array.from(
    { length: 24 },
    (_, index) => (index + 1) * 15
);

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
    const totalMinutes = index * 15;
    const hour = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0');
    const minute = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hour}:${minute}`;
});

const numberValue = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const nextQuarterTime = () => {
    const date = new Date();
    date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
    return (
        `${date.getHours()}`.padStart(2, '0') +
        ':' +
        `${date.getMinutes()}`.padStart(2, '0')
    );
};

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest}分`;
    if (rest === 0) return `${hours}時間`;
    return `${hours}時間${rest}分`;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);

const startDateTimeIso = (date: string, time: string) =>
    new Date(`${date}T${time}:00`).toISOString();

const endTimeText = (date: string, time: string, duration: number) => {
    const endAt = new Date(
        new Date(`${date}T${time}:00`).getTime() + duration * 60 * 1000
    );
    return (
        `${endAt.getHours()}`.padStart(2, '0') +
        ':' +
        `${endAt.getMinutes()}`.padStart(2, '0')
    );
};

export const CreateTreatmentPage = () => {
    const { userId } = useAuth();
    const customers = useFindCustomer();
    const employeeQuery = useMemo(
        () => replicaQL.query('スタッフ').join('ユーザーID', 'ユーザー', 'ID'),
        []
    );
    const employees = useFindEmployee(employeeQuery);
    const menus = useFindMenu();
    const categories = useFindMenuCategory();
    const { mutateAsync: createTreatment, isPending } = useCreateTreatment();

    const [customerId, setCustomerId] = useState('');
    const [customerLabel, setCustomerLabel] = useState('');
    const [staffId, setStaffId] = useState('');
    const [staffLabel, setStaffLabel] = useState('');
    const status = '予約済み' as TreatmentStatus;
    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState(nextQuarterTime);
    const [duration, setDuration] = useState(90);
    const [note, setNote] = useState('');
    const [menuSearch, setMenuSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [selectedMenuId, setSelectedMenuId] = useState('');
    const [selectedMenus, setSelectedMenus] = useState<SelectedMenu[]>([]);
    const [error, setError] = useState('');

    const defaultStaffId =
        employees?.some((employee) => employee.userId === userId) && userId
            ? userId
            : '';
    const effectiveStaffId = staffId || (staffLabel ? '' : defaultStaffId);
    const defaultStaffLabel =
        employees?.find((employee) => employee.userId === defaultStaffId)?.user
            ?.name ?? '';
    const effectiveStaffLabel = staffLabel || defaultStaffLabel;

    const selectableMenus = useMemo(
        () =>
            (menus ?? [])
                .filter((menu) => menu.menuType === '技術')
                .filter((menu) => !categoryId || menu.categoryId === categoryId)
                .filter((menu) =>
                    menu.name
                        .toLowerCase()
                        .includes(menuSearch.trim().toLowerCase())
                )
                .filter(
                    (menu) =>
                        !selectedMenus.some(
                            (selected) => selected.menuId === menu.id
                        )
                ),
        [categoryId, menuSearch, menus, selectedMenus]
    );

    const selectedMenuRows = useMemo(
        () =>
            selectedMenus
                .map((selected, index) => {
                    const menu = (menus ?? []).find(
                        (item) => item.id === selected.menuId
                    );
                    if (!menu) return null;
                    const quantity = Math.max(1, selected.quantity);
                    const discountAmount = Math.max(0, selected.discountAmount);
                    const subtotal =
                        quantity * Math.max(0, menu.price - discountAmount);
                    return { index, menu, quantity, discountAmount, subtotal };
                })
                .filter((row) => row !== null),
        [menus, selectedMenus]
    );

    const total = selectedMenuRows.reduce((sum, row) => sum + row.subtotal, 0);
    const hasInvalidDiscount = selectedMenuRows.some(
        (row) => row.discountAmount > row.menu.price
    );

    const addMenu = () => {
        const menuId = selectedMenuId || selectableMenus[0]?.id;
        if (!menuId) return;
        setSelectedMenus((prev) => [
            ...prev,
            { menuId, quantity: 1, discountAmount: 0 },
        ]);
        setSelectedMenuId('');
    };

    const updateQuantity = (index: number, value: number) => {
        setSelectedMenus((prev) =>
            prev.map((selected, currentIndex) =>
                currentIndex === index
                    ? { ...selected, quantity: Math.max(1, value) }
                    : selected
            )
        );
    };

    const updateDiscount = (index: number, value: number) => {
        setSelectedMenus((prev) =>
            prev.map((selected, currentIndex) =>
                currentIndex === index
                    ? { ...selected, discountAmount: Math.max(0, value) }
                    : selected
            )
        );
    };

    const removeMenu = (index: number) => {
        setSelectedMenus((prev) =>
            prev.filter((_, currentIndex) => currentIndex !== index)
        );
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        if (!customerId) {
            setError('顧客を選択してください');
            return;
        }
        if (!effectiveStaffId) {
            setError('担当スタッフを選択してください');
            return;
        }
        if (hasInvalidDiscount) {
            setError('値引き額は通常価格以下で入力してください');
            return;
        }

        await createTreatment({
            treatment: {
                顧客ID: customerId,
                担当スタッフID: effectiveStaffId,
                状態: status,
                開始日時: startDateTimeIso(date, startTime),
                所要時間: duration,
                備考: note.trim() || null,
            },
            treatmentMenus: selectedMenus.map((selected, index) => ({
                メニューID: selected.menuId,
                数量: selected.quantity,
                値引き額: selected.discountAmount,
                表示順: index + 1,
            })),
        });

        setSelectedMenus([]);
        setNote('');
    };

    if (!customers || !employees || !menus || !categories) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="font-body-md text-on-surface-variant">
                    登録情報を取得中...
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1000px] flex-col gap-lg px-md pb-32 pt-lg md:px-xl">
            <nav className="flex">
                <ol className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant">
                    <li>予約管理</li>
                    <li>
                        <ChevronDown className="size-4 -rotate-90" />
                    </li>
                    <li className="font-bold text-primary">予約</li>
                </ol>
            </nav>

            <section className="flex flex-col gap-md border-b border-outline-variant pb-lg md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="font-display-lg text-display-lg text-primary">
                        予約
                    </h2>
                    <p className="mt-xs text-body-lg text-on-surface-variant">
                        顧客、担当スタッフ、日時、メニューを登録します。
                    </p>
                </div>
                <button
                    className="flex h-11 items-center justify-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-lg text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-95"
                    type="button"
                    onClick={() => history.back()}
                >
                    <ArrowLeft className="size-4" />
                    <span className="font-label-lg text-label-lg">戻る</span>
                </button>
            </section>

            <form className="space-y-lg" onSubmit={submit}>
                <section className="rounded-xl bg-surface-container-lowest p-md shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-md flex items-center gap-sm border-b border-surface-container pb-sm">
                        <UserRound className="size-5 text-primary" />
                        <h3 className="font-label-lg text-label-lg text-primary">
                            基本情報
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
                        <div className="md:col-span-1">
                            <label className={labelClassName}>顧客名 *</label>
                            <CustomerCombobox
                                customers={customers}
                                value={customerLabel}
                                onValueChange={setCustomerLabel}
                                onCustomerChange={setCustomerId}
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>
                                担当スタッフ *
                            </label>
                            <StaffCombobox
                                employees={employees}
                                value={effectiveStaffLabel}
                                onValueChange={setStaffLabel}
                                onStaffChange={setStaffId}
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-xl bg-surface-container-lowest p-md shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-md flex items-center gap-sm border-b border-surface-container pb-sm">
                        <Clock3 className="size-5 text-primary" />
                        <h3 className="font-label-lg text-label-lg text-primary">
                            スケジュール
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-lg md:grid-cols-12">
                        <div className="md:col-span-4">
                            <label className={labelClassName}>施術日 *</label>
                            <input
                                className={fieldClassName}
                                type="date"
                                value={date}
                                onChange={(event) =>
                                    setDate(event.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className={labelClassName}>開始時刻 *</label>
                            <div className="relative">
                                <select
                                    className={`${fieldClassName} cursor-pointer appearance-none pr-10`}
                                    value={startTime}
                                    onChange={(event) =>
                                        setStartTime(event.target.value)
                                    }
                                    required
                                >
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <label className={labelClassName}>所要時間</label>
                            <div className="relative">
                                <select
                                    className={`${fieldClassName} cursor-pointer appearance-none pr-10`}
                                    value={duration}
                                    onChange={(event) =>
                                        setDuration(
                                            numberValue(event.target.value)
                                        )
                                    }
                                >
                                    {durationOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {formatDuration(option)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl bg-surface-container-lowest p-md shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-md flex flex-col gap-md border-b border-surface-container pb-sm md:flex-row md:items-end md:justify-between">
                        <div className="flex items-center gap-sm">
                            <Scissors className="size-5 text-primary" />
                            <h3 className="font-label-lg text-label-lg text-primary">
                                メニュー
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-sm md:grid-cols-[160px_1fr_auto]">
                            <div className="relative">
                                <select
                                    className={`${fieldClassName} cursor-pointer appearance-none pr-10`}
                                    value={categoryId}
                                    onChange={(event) =>
                                        setCategoryId(event.target.value)
                                    }
                                >
                                    <option value="">全カテゴリー</option>
                                    {categories
                                        .filter(
                                            (category) =>
                                                category.menuType === '技術'
                                        )
                                        .map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                            </div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                                <input
                                    className={`${fieldClassName} pl-10`}
                                    value={menuSearch}
                                    onChange={(event) =>
                                        setMenuSearch(event.target.value)
                                    }
                                    placeholder="メニューを検索"
                                />
                            </div>
                            <Button
                                className="h-11 gap-sm rounded-lg px-md bg-primary-container text-on-primary hover:bg-primary-container-hover active:scale-95 disabled:bg-surface-container-lowest disabled:text-on-surface-variant disabled:hover:bg-surface-container-lowest"
                                type="button"
                                onClick={addMenu}
                                disabled={selectableMenus.length === 0}
                            >
                                <Plus className="size-4" />
                                追加
                            </Button>
                        </div>
                    </div>

                    <div className="mb-md">
                        <label className={labelClassName}>
                            追加するメニュー
                        </label>
                        <div className="relative">
                            <select
                                className={`${fieldClassName} cursor-pointer appearance-none pr-10`}
                                value={selectedMenuId}
                                onChange={(event) =>
                                    setSelectedMenuId(event.target.value)
                                }
                            >
                                <option value="">
                                    {selectableMenus[0]
                                        ? 'メニューを選択してください'
                                        : '追加できるメニューがありません'}
                                </option>
                                {selectableMenus.map((menu) => (
                                    <option key={menu.id} value={menu.id}>
                                        {menu.name} /{' '}
                                        {formatCurrency(menu.price)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left">
                            <thead>
                                <tr className="bg-surface-container-low text-label-md text-on-surface-variant">
                                    <th className="rounded-l-lg px-md py-sm">
                                        メニュー名
                                    </th>
                                    <th className="px-md py-sm text-right">
                                        単価
                                    </th>
                                    <th className="px-md py-sm text-center">
                                        数量
                                    </th>
                                    <th className="px-md py-sm text-center">
                                        値引き額
                                    </th>
                                    <th className="px-md py-sm text-right">
                                        小計
                                    </th>
                                    <th className="rounded-r-lg px-md py-sm text-center">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-body-sm">
                                {selectedMenuRows.length === 0 && (
                                    <tr>
                                        <td
                                            className="px-md py-lg text-center text-on-surface-variant"
                                            colSpan={6}
                                        >
                                            メニュー未選択
                                        </td>
                                    </tr>
                                )}
                                {selectedMenuRows.map((row) => (
                                    <tr
                                        key={row.menu.id}
                                        className="border-b border-surface-container-high"
                                    >
                                        <td className="px-md py-md font-bold">
                                            {row.menu.name}
                                        </td>
                                        <td className="px-md py-md text-right">
                                            {formatCurrency(row.menu.price)}
                                        </td>
                                        <td className="px-md py-md">
                                            <input
                                                className="mx-auto block h-10 w-20 rounded border border-outline-variant bg-surface-container-lowest px-sm text-right text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                min={1}
                                                step={1}
                                                type="number"
                                                value={row.quantity}
                                                onChange={(event) =>
                                                    updateQuantity(
                                                        row.index,
                                                        numberValue(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-md py-md">
                                            <input
                                                className="mx-auto block h-10 w-28 rounded border border-outline-variant bg-surface-container-lowest px-sm text-right text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                min={0}
                                                max={row.menu.price}
                                                step={1}
                                                type="number"
                                                value={row.discountAmount}
                                                onChange={(event) =>
                                                    updateDiscount(
                                                        row.index,
                                                        numberValue(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                            />
                                        </td>
                                        <td className="px-md py-md text-right">
                                            {formatCurrency(row.subtotal)}
                                        </td>
                                        <td className="px-md py-md text-center">
                                            <button
                                                className="rounded p-xs text-error transition-colors hover:bg-error-container active:scale-95"
                                                type="button"
                                                onClick={() =>
                                                    removeMenu(row.index)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
                    <section className="rounded-xl bg-surface-container-lowest p-md shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                        <div className="mb-sm flex items-center gap-sm">
                            <FileText className="size-5 text-primary" />
                            <label className="font-label-lg text-label-lg text-primary">
                                備考
                            </label>
                        </div>
                        <textarea
                            className="h-32 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="髪の状態や相談事項など"
                        />
                    </section>

                    <section className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-md shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                        <div>
                            <div className="mb-xs flex items-center gap-sm">
                                <ClipboardList className="size-5 text-primary" />
                                <span className="font-label-lg text-label-lg text-primary">
                                    合計
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="mr-sm text-label-lg text-on-surface-variant">
                                    Total
                                </span>
                                <span className="font-display-lg text-display-lg text-primary">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-md rounded-lg bg-primary-container/5 p-sm">
                            <div className="mb-xs flex justify-between text-label-md text-on-surface-variant">
                                <span>合計施術時間</span>
                                <span>{formatDuration(duration)}</span>
                            </div>
                            <div className="flex justify-between text-label-md text-on-surface-variant">
                                <span>終了時刻</span>
                                <span>
                                    {endTimeText(date, startTime, duration)}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>

                {error && (
                    <p className="rounded-lg bg-error-container px-md py-sm text-body-sm text-on-error-container">
                        {error}
                    </p>
                )}

                <footer className="flex flex-col items-stretch justify-end gap-md pt-lg sm:flex-row">
                    <button
                        className="h-12 rounded-lg border border-outline-variant px-xl font-label-lg text-label-lg text-on-surface transition-all hover:bg-surface-container active:scale-95"
                        type="button"
                        onClick={() => history.back()}
                    >
                        キャンセル
                    </button>
                    <Button
                        className="h-12 gap-sm rounded-lg px-xl bg-primary-container text-on-primary hover:bg-primary-container-hover active:scale-95 disabled:bg-surface-container-lowest disabled:text-on-surface-variant disabled:hover:bg-surface-container-lowest"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        予約を登録する
                    </Button>
                </footer>
            </form>
        </div>
    );
};
