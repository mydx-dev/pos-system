import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useDeleteUser = () => {
    const { sessionToken } = useAuth();
    return useMutation({
        mutationFn: async ({ userId }: { userId: string }) => {
            await server.deleteUser({
                sessionToken: sessionToken!,
                id: userId,
            });

            await replica.transaction(
                'rw',
                replica.table('ユーザー'),
                replica.table('ロール'),
                replica.table('スタッフ'),
                async () => {
                    await replica.table('ユーザー').delete(userId);
                    await replica.table('ロール').delete(userId);
                    await replica.table('スタッフ').delete(userId);
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
