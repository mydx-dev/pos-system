import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../components/ui/field';
import { server } from '../lib/AppsScriptClient';

const schema = z
    .object({
        name: z.string().min(1, '名前は必須です'),
        email: z
            .string()
            .regex(
                /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                '有効なメールアドレスを入力してください'
            ),
        password: z
            .string()
            .min(8, 'パスワードは8文字以上である必要があります')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/,
                'パスワードは英語大文字、小文字、数字を含む必要があります'
            ),
        confirmPassword: z.string(),
    })
    .required()
    .refine((data) => data.password === data.confirmPassword, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['confirmPassword'],
    });

export const CreateUserPage = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });
    const handleCreateUser = useMutation({
        mutationFn: () =>
            server.createUser({
                name: getValues('name'),
                email: getValues('email'),
                password: getValues('password'),
            }),
        onSuccess: () => {
            toast.success('ユーザーが作成されました');
        },
        onError: () => {
            toast.error('ユーザーの作成に失敗しました');
        },
    });
    return (
        <div className="relative left-1/2 w-screen -translate-x-1/2 px-6">
            <section className="relative mx-auto w-[min(100vw-3rem,42rem)] overflow-hidden rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)]">
                {/* Decorative Subtle Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <form
                        className="space-y-6"
                        onSubmit={handleSubmit(() => handleCreateUser.mutate())}
                    >
                        <FieldGroup className="space-y-6">
                            {/* Name Field */}
                            <Field className="w-full" orientation="vertical">
                                <FieldLabel
                                    className="px-1 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                    required
                                >
                                    名前
                                </FieldLabel>
                                <FieldContent className="space-y-2">
                                    <div className="relative">
                                        <input
                                            data-testid="name-input"
                                            className="w-full rounded-md border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all duration-200 placeholder:text-outline/50 focus:ring-1 focus:ring-surface-tint"
                                            placeholder="名前を入力してください"
                                            type="text"
                                            {...register('name')}
                                        />
                                    </div>
                                    <FieldError
                                        errors={
                                            errors.name
                                                ? [errors.name]
                                                : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>
                            {/* Email Field */}
                            <Field className="w-full" orientation="vertical">
                                <FieldLabel
                                    className="px-1 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                    required
                                >
                                    メールアドレス
                                </FieldLabel>
                                <FieldContent className="space-y-2">
                                    <div className="relative">
                                        <input
                                            data-testid="email-input"
                                            className="w-full rounded-md border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all duration-200 placeholder:text-outline/50 focus:ring-1 focus:ring-surface-tint"
                                            placeholder="example@pipelinepro.com"
                                            type="email"
                                            {...register('email')}
                                        />
                                    </div>
                                    <FieldError
                                        errors={
                                            errors.email
                                                ? [errors.email]
                                                : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>
                            {/* Password Field */}
                            <Field className="w-full" orientation="vertical">
                                <FieldLabel
                                    className="px-1 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                    required
                                >
                                    パスワード
                                </FieldLabel>
                                <FieldContent className="space-y-2">
                                    <div className="relative">
                                        <input
                                            data-testid="password-input"
                                            className="w-full rounded-md border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all duration-200 placeholder:text-outline/50 focus:ring-1 focus:ring-surface-tint"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('password')}
                                        />
                                    </div>
                                    <FieldError
                                        errors={
                                            errors.password
                                                ? [errors.password]
                                                : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>
                            {/* Confirm Password Field */}
                            <Field className="w-full" orientation="vertical">
                                <FieldLabel
                                    className="px-1 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant"
                                    required
                                >
                                    パスワード（確認）
                                </FieldLabel>
                                <FieldContent className="space-y-2">
                                    <div className="relative">
                                        <input
                                            data-testid="confirm-password-input"
                                            className="w-full rounded-md border-none bg-surface-container-high px-4 py-3 text-on-surface transition-all duration-200 placeholder:text-outline/50 focus:ring-1 focus:ring-surface-tint"
                                            placeholder="••••••••"
                                            type="password"
                                            {...register('confirmPassword')}
                                        />
                                    </div>
                                    <FieldError
                                        errors={
                                            errors.confirmPassword
                                                ? [errors.confirmPassword]
                                                : undefined
                                        }
                                    />
                                </FieldContent>
                            </Field>
                        </FieldGroup>
                        {/* Create User Button */}
                        <button
                            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-md shadow-lg enabled:active:scale-[0.98] transition-transform duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="submit"
                            disabled={handleCreateUser.isPending || !isValid}
                        >
                            新規登録
                            {handleCreateUser.isPending && (
                                <span
                                    data-testid="progress-activity"
                                    className="material-symbols-rounded animate-spin"
                                >
                                    progress_activity
                                </span>
                            )}
                        </button>
                    </form>
                </div>
            </section>
            {/* Secondary CTA */}
            <section className="mx-auto mt-8 text-center px-4 w-[min(100vw-3rem,42rem)]">
                <p className="text-on-surface-variant text-sm mb-4">
                    すでにアカウントをお持ちですか？
                </p>
                <NavLink
                    className="block w-full border border-outline-variant text-primary font-bold py-3 rounded-md hover:bg-surface-container transition-colors duration-200"
                    to="/login"
                >
                    ログイン
                </NavLink>
            </section>
        </div>
    );
};
