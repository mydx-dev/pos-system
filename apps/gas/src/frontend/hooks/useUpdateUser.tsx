import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User } from '../../shared/domain/entity/User';

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: async ({
            sessionToken,
            user,
            updateParams: data,
        }: {
            sessionToken: string;
            user: User;
            updateParams: { name: string; email: string };
        }) => {
            const { user: updatedUser } = await server.updateUser({
                sessionToken,
                user: {
                    ID: user.id,
                    氏名: data.name,
                    メールアドレス: data.email,
                    バージョン: user.version,
                },
            });

            await replica.transaction(
                'rw',
                replica.table('ユーザー'),
                async () => {
                    await replica.table('ユーザー').put(updatedUser);
                }
            );
        },

        onSuccess: () => {
            toast.success('ユーザー情報を更新しました');
        },

        onError: () => {
            toast.error('ユーザー情報の更新に失敗しました');
        },
    });
};
