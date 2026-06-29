import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User } from '../../shared/domain/entity/User';

export const useDeleteUser = () => {
    return useMutation({
        mutationFn: async ({
            sessionToken,
            user,
        }: {
            sessionToken: string;
            user: User;
        }) => {
            await server.deleteUser({
                sessionToken: sessionToken!,
                id: user!.id,
            });

            await replica.transaction(
                'rw',
                replica.table('ユーザー'),
                async () => {
                    await replica.table('ユーザー').delete(user.id);
                }
            );
        },
        onSuccess: () => {
            toast.success('ユーザーを削除しました');
        },
        onError: () => {
            toast.error('ユーザーの削除に失敗しました');
        },
    });
};
