import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { emailSchema } from '../../../shared/schemas/form';
import { useCreateEmployee } from '../../hooks/useCreateEmployee';

export const EmployeeForm = () => {
    const { mutate: createEmployee, isPending } = useCreateEmployee();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(
            z.object({
                氏名: z.string().min(1, '氏名は必須です'),
                メールアドレス: emailSchema,
            })
        ),
        mode: 'onChange',
    });

    return (
        <>
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <div>
                    <h3 className="font-headline-md text-headline-md text-primary">
                        スタッフ新規登録
                    </h3>
                    <p className="text-label-md text-on-surface-variant">
                        基本情報とアカウント設定を入力してください。
                    </p>
                </div>
            </div>
            <form
                className="flex-1 overflow-y-auto custom-scrollbar p-lg space-y-xl"
                onSubmit={handleSubmit((data) => {
                    createEmployee(data);
                })}
            >
                {/* Section: Basic Info */}
                <section className="space-y-md">
                    <h4 className="font-label-lg text-primary border-l-4 border-primary-container pl-md">
                        基本情報
                    </h4>
                    <div className="grid grid-cols-2 gap-md">
                        <div className="col-span-1 space-y-xs">
                            <label className="text-label-md text-on-surface-variant">
                                氏名
                            </label>
                            <input
                                {...register('氏名')}
                                className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-sm outline-none"
                                placeholder="例：山田 太郎"
                                type="text"
                            />
                            {errors.氏名 && (
                                <p className="text-error text-label-sm">
                                    {errors.氏名.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>
                {/* Section: Contact */}
                <div className="space-y-xs">
                    <label className="text-label-md text-on-surface-variant">
                        メールアドレス
                    </label>
                    <input
                        {...register('メールアドレス')}
                        className="w-full p-md border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-sm outline-none"
                        placeholder="example@gmail.com"
                        type="email"
                    />
                    {errors.メールアドレス && (
                        <p className="text-error text-label-sm">
                            {errors.メールアドレス.message}
                        </p>
                    )}
                </div>
                {/* Section: Professional */}
                <div className="mt-lg p-lg bg-surface border-t border-outline-variant flex gap-md">
                    <button
                        className="flex-1 py-md border border-outline-variant rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                        onClick={() => history.back()}
                    >
                        キャンセル
                    </button>
                    <button
                        className="flex-1 py-md bg-primary-container text-on-primary rounded-lg font-label-lg shadow-md hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        スタッフを保存
                    </button>
                </div>
            </form>
        </>
    );
};
