import { Customer } from '@mydx-pos/shared/domain/entity/Customer';
import { Employee } from '@mydx-pos/shared/domain/entity/Employee';
import { routes } from '@/../shared/routes';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { useFindCustomer } from '@/hooks/useFindCustomer';
import { useFindEmployee } from '@/hooks/useFindEmployee';
import { replicaQL } from '@/lib/AppsScriptClient';
import { CalendarDays, Plus, UserRoundX } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const fieldClassName =
    'h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20';

const nullableText = (value: string | null | undefined) => value || '-';

const toBirthMonth = (birthDate: string | null | undefined) => {
    if (!birthDate) {
        return null;
    }

    const date = new Date(birthDate);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.getMonth() + 1;
};

const formatDate = (value: string | null | undefined) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

const getStaffName = (
    customer: Customer,
    employeeById: Map<string, Employee>
) => {
    const staffId = customer.primaryStaffId;
    if (!staffId) {
        return '未設定';
    }

    return employeeById.get(staffId)?.user?.name ?? '未設定';
};

const getThresholdDate = (monthsAgo: number) => {
    const threshold = new Date();
    threshold.setMonth(threshold.getMonth() - monthsAgo);
    threshold.setHours(23, 59, 59, 999);
    return threshold;
};

type CustomerFilterOptions = {
    name: string;
    staffId: string;
    isStaffFixed: boolean | null;
    birthMonth: number | null;
    threshold: Date | null;
};

const isBeforeThreshold = (
    value: string | null | undefined,
    threshold: Date
) => {
    if (!value) {
        return false;
    }

    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date <= threshold;
};

const matchesCustomerFilters = (
    customer: Customer,
    options: CustomerFilterOptions
) => {
    const matchesName = !options.name || customer.name.includes(options.name);
    const matchesStaff =
        !options.staffId || customer.primaryStaffId === options.staffId;
    const matchesFixed =
        options.isStaffFixed === null ||
        customer.isStaffFixed === options.isStaffFixed;
    const matchesBirthMonth =
        options.birthMonth === null ||
        toBirthMonth(customer.birthDate) === options.birthMonth;
    const matchesLastVisit =
        !options.threshold ||
        isBeforeThreshold(customer.lastVisitDate, options.threshold);

    return (
        matchesName &&
        matchesStaff &&
        matchesFixed &&
        matchesBirthMonth &&
        matchesLastVisit
    );
};

const compareCustomers = (sort: string) => (a: Customer, b: Customer) => {
    if (sort === 'lastVisitDate') {
        return (
            new Date(a.lastVisitDate ?? 0).getTime() -
            new Date(b.lastVisitDate ?? 0).getTime()
        );
    }

    if (sort === 'birthMonth') {
        return (
            (toBirthMonth(a.birthDate) ?? 13) -
            (toBirthMonth(b.birthDate) ?? 13)
        );
    }

    return a.name.localeCompare(b.name, 'ja');
};

export const CustomerListPage = () => {
    const navigate = useNavigate();
    const {
        name,
        setName,
        staffId,
        setStaffId,
        isStaffFixed,
        setIsStaffFixed,
        birthMonth,
        setBirthMonth,
        lastVisitMonthsAgo,
        setLastVisitMonthsAgo,
        sort,
        setSort,
        clearFilters,
    } = useCustomerFilters();
    const customerQuery = useMemo(
        () => replicaQL.query('顧客').join('ID', '施術', '顧客ID'),
        []
    );
    const employeeQuery = useMemo(
        () => replicaQL.query('スタッフ').join('ユーザーID', 'ユーザー', 'ID'),
        []
    );
    const customers = useFindCustomer(customerQuery);
    const employees = useFindEmployee(employeeQuery);

    const employeeById = useMemo(() => {
        return new Map(
            (employees ?? []).map((employee) => [employee.userId, employee])
        );
    }, [employees]);

    const filteredCustomers = useMemo(() => {
        const threshold =
            lastVisitMonthsAgo !== null
                ? getThresholdDate(lastVisitMonthsAgo)
                : null;

        return [...(customers ?? [])]
            .filter((customer) =>
                matchesCustomerFilters(customer, {
                    name,
                    staffId,
                    isStaffFixed,
                    birthMonth,
                    threshold,
                })
            )
            .sort(compareCustomers(sort));
    }, [
        birthMonth,
        customers,
        isStaffFixed,
        lastVisitMonthsAgo,
        name,
        sort,
        staffId,
    ]);

    const isLoading = !customers || !employees;

    return (
        <div className="mx-auto w-full max-w-[1440px] space-y-lg p-md pb-32 md:p-margin-desktop">
            <div className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="font-headline-lg text-headline-lg text-primary">
                        顧客一覧
                    </h2>
                    <p className="text-body-md text-on-surface-variant">
                        登録済みの顧客情報を管理・検索できます。
                    </p>
                </div>
                <button
                    className="inline-flex h-11 items-center justify-center gap-sm rounded-lg bg-primary px-lg text-on-primary transition-all hover:opacity-90 active:scale-95"
                    onClick={() => navigate(routes.customer.create)}
                    type="button"
                >
                    <Plus className="size-4" />
                    <span className="font-label-lg text-label-lg">
                        顧客登録
                    </span>
                </button>
            </div>

            <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-lg shadow-sm">
                <div className="grid grid-cols-1 items-end gap-md md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            名前
                        </label>
                        <input
                            className={fieldClassName}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="顧客を検索..."
                            type="text"
                            value={name}
                        />
                    </div>
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            主担当スタッフ
                        </label>
                        <select
                            className={fieldClassName}
                            onChange={(e) => setStaffId(e.target.value)}
                            value={staffId}
                        >
                            <option value="">すべてのスタッフ</option>
                            {(employees ?? []).map((employee) => (
                                <option
                                    key={employee.userId}
                                    value={employee.userId}
                                >
                                    {employee.user?.name ?? employee.userId}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            担当固定
                        </label>
                        <select
                            className={fieldClassName}
                            onChange={(e) => {
                                if (!e.target.value) {
                                    setIsStaffFixed(null);
                                    return;
                                }

                                setIsStaffFixed(e.target.value === 'true');
                            }}
                            value={
                                isStaffFixed === null
                                    ? ''
                                    : String(isStaffFixed)
                            }
                        >
                            <option value="">指定なし</option>
                            <option value="true">固定あり</option>
                            <option value="false">固定なし</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            誕生月
                        </label>
                        <select
                            className={fieldClassName}
                            onChange={(e) =>
                                setBirthMonth(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                            }
                            value={birthMonth ?? ''}
                        >
                            <option value="">指定なし</option>
                            {Array.from({ length: 12 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1}月
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            最終来店日
                        </label>
                        <select
                            className={fieldClassName}
                            onChange={(e) =>
                                setLastVisitMonthsAgo(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null
                                )
                            }
                            value={lastVisitMonthsAgo ?? ''}
                        >
                            <option value="">指定なし</option>
                            <option value="1">1ヶ月以上前</option>
                            <option value="3">3ヶ月以上前</option>
                            <option value="6">6ヶ月以上前</option>
                            <option value="12">1年以上前</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-xs block text-label-md text-on-surface-variant">
                            並び順
                        </label>
                        <select
                            aria-label="並び順"
                            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest text-center text-on-surface-variant"
                            onChange={(e) => setSort(e.target.value)}
                            value={sort}
                        >
                            <option value="name">氏名</option>
                            <option value="lastVisitDate">最終来店日</option>
                            <option value="birthMonth">誕生月</option>
                        </select>
                    </div>
                    <div className="flex gap-sm">
                        <button
                            className="h-10 flex-1 rounded-lg border border-outline-variant bg-surface-container px-md text-label-lg font-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-high"
                            onClick={clearFilters}
                            type="button"
                        >
                            クリア
                        </button>
                    </div>
                </div>
            </section>

            <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-collapse text-left">
                        <thead className="border-b border-outline-variant bg-surface-container-low">
                            <tr>
                                {[
                                    '氏名',
                                    '主担当',
                                    '固定',
                                    '電話番号',
                                    'メールアドレス',
                                    '誕生月',
                                    '最終来店日',
                                ].map((heading) => (
                                    <th
                                        className="px-lg py-md text-label-lg font-label-lg uppercase text-on-surface-variant"
                                        key={heading}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/30">
                            {isLoading && (
                                <tr>
                                    <td className="p-lg" colSpan={7}>
                                        <div className="flex animate-pulse flex-col gap-sm">
                                            <div className="h-4 w-3/4 rounded bg-surface-container" />
                                            <div className="h-4 w-1/2 rounded bg-surface-container" />
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!isLoading &&
                                filteredCustomers.map((customer) => (
                                    <tr
                                        className="cursor-pointer transition-colors hover:bg-surface-container-low"
                                        key={customer.id}
                                        onClick={() =>
                                            navigate(
                                                routes.customer.detail.build(
                                                    customer.id
                                                )
                                            )
                                        }
                                    >
                                        <td className="px-lg py-md">
                                            <p className="font-label-lg text-label-lg text-primary">
                                                {customer.name}
                                            </p>
                                        </td>
                                        <td className="px-lg py-md text-body-sm text-on-surface">
                                            {getStaffName(
                                                customer,
                                                employeeById
                                            )}
                                        </td>
                                        <td className="px-lg py-md">
                                            <span
                                                className={
                                                    customer.isStaffFixed
                                                        ? 'inline-flex rounded-full bg-secondary-container px-sm py-xs text-label-md font-label-md text-on-secondary-container'
                                                        : 'inline-flex rounded-full bg-surface-container px-sm py-xs text-label-md font-label-md text-on-surface-variant'
                                                }
                                            >
                                                {customer.isStaffFixed
                                                    ? '固定'
                                                    : 'なし'}
                                            </span>
                                        </td>
                                        <td className="px-lg py-md text-body-sm text-on-surface">
                                            {nullableText(customer.phoneNumber)}
                                        </td>
                                        <td className="px-lg py-md text-body-sm text-on-surface">
                                            {nullableText(customer.email)}
                                        </td>
                                        <td className="px-lg py-md text-center text-body-sm text-on-surface">
                                            {toBirthMonth(customer.birthDate)
                                                ? `${toBirthMonth(
                                                      customer.birthDate
                                                  )}月`
                                                : '-'}
                                        </td>
                                        <td className="px-lg py-md text-body-sm text-on-surface">
                                            <span className="inline-flex items-center gap-xs">
                                                <CalendarDays className="size-4 text-on-surface-variant" />
                                                {formatDate(
                                                    customer.lastVisitDate
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {!isLoading && filteredCustomers.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-lg py-24 text-center">
                        <UserRoundX className="mb-md size-14 text-outline-variant" />
                        <h3 className="font-headline-md text-headline-md text-on-surface-variant">
                            顧客が見つかりません
                        </h3>
                        <p className="mt-sm text-body-md text-on-surface-variant">
                            検索条件を変えるか、新しい顧客を登録してください。
                        </p>
                        <button
                            className="mt-lg inline-flex h-10 items-center justify-center gap-sm rounded-lg bg-primary px-lg text-on-primary transition-all hover:opacity-90 active:scale-95"
                            onClick={() => navigate(routes.customer.create)}
                            type="button"
                        >
                            <Plus className="size-4" />
                            顧客登録
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-lg py-md">
                    <p className="text-body-sm text-on-surface-variant">
                        全 {filteredCustomers.length} 名を表示
                    </p>
                </div>
            </div>
        </div>
    );
};
