import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronDown,
    Contact,
    FileText,
    Loader2,
    MapPin,
    Save,
    User,
} from 'lucide-react';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { CreateCustomerInput } from '@mydx-pos/shared/api/customer';
import { emailSchema } from '@mydx-pos/shared/schemas/form';
import { useCreateCustomer } from '../../hooks/useCreateCustomer';
import { useFindEmployee } from '../../hooks/useFindEmployee';
import { replicaQL } from '../../lib/AppsScriptClient';

const optionalEmailSchema = z
    .string()
    .refine(
        (value) => value === '' || emailSchema.safeParse(value).success,
        '有効なメールアドレスを入力してください'
    );

const customerFormSchema = z.object({
    氏名: z.string().min(1, '氏名は必須です'),
    主担当スタッフID: z.string(),
    担当固定: z.boolean(),
    メールアドレス: optionalEmailSchema,
    電話番号: z.string(),
    生年月日: z.string(),
    郵便番号: z.string(),
    住所: z.string(),
    備考: z.string(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const toNullable = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
};

const fieldClassName =
    'h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20';

const labelClassName =
    'flex items-center gap-xs font-label-lg text-label-lg text-on-surface';

export const CustomerForm = () => {
    const { mutateAsync: createCustomer, isPending } = useCreateCustomer();
    const employeeQuery = useMemo(
        () => replicaQL.query('スタッフ').join('ユーザーID', 'ユーザー', 'ID'),
        []
    );
    const employees = useFindEmployee(employeeQuery);
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isValid },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerFormSchema),
        mode: 'onChange',
        defaultValues: {
            氏名: '',
            主担当スタッフID: '',
            担当固定: false,
            メールアドレス: '',
            電話番号: '',
            生年月日: '',
            郵便番号: '',
            住所: '',
            備考: '',
        },
    });
    const isStaffFixed = useWatch({ control, name: '担当固定' });

    const onSubmit = async (values: CustomerFormValues) => {
        const customer: CreateCustomerInput['customer'] = {
            氏名: values.氏名.trim(),
            主担当スタッフID: toNullable(values.主担当スタッフID),
            担当固定: values.担当固定,
            メールアドレス: toNullable(values.メールアドレス),
            電話番号: toNullable(values.電話番号),
            生年月日: toNullable(values.生年月日),
            郵便番号: toNullable(values.郵便番号),
            住所: toNullable(values.住所),
            備考: toNullable(values.備考),
        };

        await createCustomer(customer);
        reset();
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1000px] flex-col gap-lg px-md pb-32 pt-lg md:px-xl">
            <nav className="flex">
                <ol className="flex items-center gap-xs font-label-md text-label-md text-on-surface-variant">
                    <li>顧客管理</li>
                    <li>
                        <ChevronDown className="size-4 -rotate-90" />
                    </li>
                    <li className="font-bold text-primary">新規登録</li>
                </ol>
            </nav>

            <section className="flex flex-col gap-md border-b border-outline-variant pb-lg md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="font-display-lg text-display-lg text-primary">
                        顧客新規登録
                    </h2>
                    <p className="mt-xs text-body-lg text-on-surface-variant">
                        基本情報、主担当、連絡先、住所を登録します。
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

            <form className="space-y-lg" onSubmit={handleSubmit(onSubmit)}>
                <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-md">
                        <User className="size-5 text-primary" />
                        <h3 className="font-headline-md text-headline-md text-primary">
                            基本情報
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
                        <div className="flex flex-col gap-sm">
                            <label className={labelClassName}>
                                氏名 <span className="text-error">*</span>
                            </label>
                            <input
                                {...register('氏名')}
                                className={fieldClassName}
                                placeholder="例: 山田 花子"
                                type="text"
                            />
                            {errors.氏名 && (
                                <p className="text-label-sm text-error">
                                    {errors.氏名.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-sm">
                            <label className={labelClassName}>
                                担当スタッフ
                            </label>
                            <div className="relative">
                                <select
                                    {...register('主担当スタッフID')}
                                    className={`${fieldClassName} cursor-pointer appearance-none pr-10`}
                                    disabled={!employees}
                                >
                                    <option value="">未選択</option>
                                    {(employees ?? []).map((employee) => (
                                        <option
                                            key={employee.userId}
                                            value={employee.userId}
                                        >
                                            {employee.user?.name ??
                                                employee.userId}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-sm">
                            <label className={labelClassName}>
                                <Calendar className="size-4" />
                                生年月日
                            </label>
                            <input
                                {...register('生年月日')}
                                className={fieldClassName}
                                type="date"
                            />
                        </div>

                        <div className="flex items-center gap-md rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm">
                            <label className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
                                <input
                                    {...register('担当固定')}
                                    className="peer sr-only"
                                    type="checkbox"
                                />
                                <span className="absolute inset-0 rounded-full bg-surface-container-highest transition-colors peer-checked:bg-primary" />
                                <span className="absolute left-1 top-1 size-5 rounded-full bg-surface-container-lowest transition-transform peer-checked:translate-x-5" />
                            </label>
                            <div>
                                <p className="font-label-lg text-label-lg text-on-surface">
                                    担当を固定する
                                </p>
                                <p className="text-body-sm text-on-surface-variant">
                                    {isStaffFixed
                                        ? '次回以降も主担当スタッフを優先します'
                                        : '主担当は管理用の参考情報として扱います'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-md">
                        <Contact className="size-5 text-primary" />
                        <h3 className="font-headline-md text-headline-md text-primary">
                            連絡先
                        </h3>
                    </div>
                    <div className="space-y-lg">
                        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
                            <div className="flex flex-col gap-sm">
                                <label className={labelClassName}>
                                    電話番号
                                </label>
                                <input
                                    {...register('電話番号')}
                                    className={fieldClassName}
                                    placeholder="090-0000-0000"
                                    type="tel"
                                />
                            </div>
                            <div className="flex flex-col gap-sm">
                                <label className={labelClassName}>
                                    メールアドレス
                                </label>
                                <input
                                    {...register('メールアドレス')}
                                    className={fieldClassName}
                                    placeholder="example@mail.com"
                                    type="email"
                                />
                                {errors.メールアドレス && (
                                    <p className="text-label-sm text-error">
                                        {errors.メールアドレス.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-lg md:grid-cols-[minmax(180px,240px)_1fr]">
                            <div className="flex flex-col gap-sm">
                                <label className={labelClassName}>
                                    <MapPin className="size-4" />
                                    郵便番号
                                </label>
                                <input
                                    {...register('郵便番号')}
                                    className={fieldClassName}
                                    placeholder="123-4567"
                                    type="text"
                                />
                            </div>
                            <div className="flex flex-col gap-sm">
                                <label className={labelClassName}>住所</label>
                                <input
                                    {...register('住所')}
                                    className={fieldClassName}
                                    placeholder="東京都渋谷区神宮前1-2-3"
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-lg shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                    <div className="mb-lg flex items-center gap-sm border-b border-outline-variant pb-md">
                        <FileText className="size-5 text-primary" />
                        <h3 className="font-headline-md text-headline-md text-primary">
                            その他
                        </h3>
                    </div>
                    <div className="flex flex-col gap-sm">
                        <label className={labelClassName}>備考</label>
                        <textarea
                            {...register('備考')}
                            className="min-h-32 w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-3 text-body-md outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="お客様の好みや注意事項などがあれば入力してください。"
                        />
                    </div>
                </section>

                <div className="flex flex-col-reverse items-stretch gap-md border-t border-outline-variant pt-lg sm:flex-row sm:justify-end">
                    <button
                        className="flex h-12 items-center justify-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-xl font-label-lg text-label-lg text-on-surface-variant transition-all hover:bg-surface-container-high active:scale-95"
                        type="button"
                        onClick={() => history.back()}
                    >
                        キャンセル
                    </button>
                    <button
                        className="flex h-12 items-center justify-center gap-sm rounded-lg bg-primary-container px-xl font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        顧客を登録する
                    </button>
                    {!isPending && isValid && (
                        <div className="flex items-center justify-center gap-xs text-label-md text-on-surface-variant sm:mr-auto">
                            <Check className="size-4 text-primary" />
                            保存できます
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};
