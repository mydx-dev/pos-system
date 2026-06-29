import { User } from '@/../shared/domain/entity/User';
import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useApproveUser = () => {
    return useMutation({
        mutationFn: async ({
            sessionToken,
            user,
        }: {
            sessionToken: string;
            user: User;
        }) => {
            const { user: approvedUser } = await server.approveUser({
                sessionToken: sessionToken!,
                user: {
                    ID: user!.id,
                    バージョン: user!.version,
                },
            });

            if (!approvedUser) {
                throw new Error('ユーザーの承認に失敗しました');
            }

            await replica.transaction(
                'rw',
                replica.table('ユーザー'),
                async () => {
                    await replica.table('ユーザー').put(approvedUser);
                }
            );
        },
        onSuccess: () => {
            toast.success('ユーザーを承認しました');
        },
        onError: () => {
            toast.error('ユーザーの承認に失敗しました');
        },
    });
};
