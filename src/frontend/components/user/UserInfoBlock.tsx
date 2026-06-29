import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { UseFormRegisterReturn } from 'react-hook-form';

export const UserInfoBlock = ({
    label,
    value,
    editable,
    register,
    error,
}: {
    label: string;
    value: string;
    editable: boolean;
    register: UseFormRegisterReturn;
    error: string | undefined;
}) => {
    return (
        <Field orientation="vertical">
            <FieldLabel className="block text-xs font-label text-on-surface-variant/60 mb-2">
                {label}
            </FieldLabel>
            {editable ? (
                <Input
                    type="text"
                    className="w-full px-3 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                    {...register}
                />
            ) : (
                <p className="text-on-surface font-semibold text-md">{value}</p>
            )}
            {error && <FieldError>{error}</FieldError>}
        </Field>
    );
};
