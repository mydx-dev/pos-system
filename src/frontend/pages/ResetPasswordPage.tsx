import { Button } from '@/components/ui/button';
import { useInitialize } from '@/hooks/useInitialize';
import { server } from '@/lib/AppsScriptClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppError } from '@mydx-dev/gas-boost-runtime/core';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { routes } from '../../shared/routes';
import { passwordSchema } from '../../shared/schemas/form';
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '../components/ui/field';
import { PasswordInput } from '../components/user/PasswordInput';

const schema = z
    .object({
        newPassword: passwordSchema,
        confirmPassword: z.string(),
    })
    .required()
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'パスワードと確認用パスワードが一致しません',
        path: ['confirmPassword'],
    });

export const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token') || '';
    const { isSetupCompleted, isTermsAccepted } = useInitialize();

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            server.resetPassword({
                token,
                newPassword: getValues('newPassword'),
            }),
        onSuccess: () => {
            if (!isSetupCompleted || !isTermsAccepted) {
                toast.info(
                    'パスワードがリセットされました。初期設定を完了してください。',
                    {
                        action: (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    navigate(routes.system.initialize);
                                }}
                            >
                                初期設定へ
                            </Button>
                        ),
                    }
                );
                return;
            }
            toast.success(
                'パスワードが正常にリセットされました。新しいパスワードでログインしてください。',
                {
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigate(routes.user.login);
                            }}
                        >
                            ログインへ
                        </Button>
                    ),
                }
            );
        },
        onError: (error: AppError) => {
            if (error.status === 403) {
                toast.error(error.message, {
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigate(routes.user.forgotPassword);
                            }}
                        >
                            パスワードリセットへ
                        </Button>
                    ),
                });
            }
        },
    });

    return (
        <>
            {/* Form Card (The Digital Curator Style) */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(0,32,69,0.08)] relative overflow-hidden">
                <div className="mb-8">
                    <h2 className="font-headline font-bold text-2xl text-primary leading-tight">
                        新しいパスワードの設定
                    </h2>
                    <p className="text-on-surface-variant mt-2 text-sm">
                        新しいパスワードを入力してください。
                    </p>
                </div>
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(() => mutate())}
                >
                    <FieldGroup>
                        {/* Password Field 1 */}
                        <Field className="space-y-2">
                            <FieldLabel
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                新しいパスワード
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    placeholder="••••••••"
                                    {...register('newPassword')}
                                />
                            </FieldContent>
                            <FieldError
                                errors={
                                    errors.newPassword
                                        ? [errors.newPassword]
                                        : undefined
                                }
                            />
                        </Field>
                        {/* Password Field 2 */}
                        <Field className="space-y-2">
                            <FieldLabel
                                className="block font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant px-1"
                                required
                            >
                                パスワードの確認
                            </FieldLabel>
                            <FieldContent>
                                <PasswordInput
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                    leftIcon={
                                        <span className="material-symbols-outlined">
                                            verified_user
                                        </span>
                                    }
                                />
                            </FieldContent>
                            <FieldError
                                errors={
                                    errors.confirmPassword
                                        ? [errors.confirmPassword]
                                        : undefined
                                }
                            />
                        </Field>
                        {/* Password Requirements Hint (Asymmetric metadata) */}
                        <div className="bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
                            <span
                                className="material-symbols-outlined text-on-tertiary-fixed-variant text-lg mt-0.5"
                                data-icon="info"
                            >
                                info
                            </span>
                            <ul className="text-[11px] leading-relaxed text-on-surface-variant space-y-1">
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-tertiary-fixed"></span>
                                    8文字以上、1文字以上の大文字を含める必要があります
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-tertiary-fixed"></span>
                                    数字を含めてください
                                </li>
                            </ul>
                        </div>
                    </FieldGroup>
                    {/* Action Button (Premium Gradient) */}
                    <button
                        className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-lg enabled:active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={!isValid || isPending}
                    >
                        <span>パスワードを保存</span>
                        {isPending ? (
                            <span
                                data-testid="progress-activity"
                                className="material-symbols-outlined animate-spin"
                            >
                                progress_activity
                            </span>
                        ) : (
                            <span
                                className="material-symbols-outlined text-lg"
                                data-icon="arrow_forward"
                            >
                                arrow_forward
                            </span>
                        )}
                    </button>
                </form>
                {/* Back to Login (Subtle Tonal Link) */}
                <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
                    <NavLink
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                        to="/login"
                    >
                        <span
                            className="material-symbols-outlined text-sm"
                            data-icon="chevron_left"
                        >
                            chevron_left
                        </span>
                        ログインに戻る
                    </NavLink>
                </div>
            </section>
        </>
    );
};
