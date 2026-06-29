import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { User } from '../../shared/domain/entity/User';

export const useUnapproveUser = () => {
    return useMutation({
        mutationFn: async ({
            sessionToken,
            user,
        }: {
            sessionToken: string;
            user: User;
        }) => {
            const { user: unapprovedUser } = await server.unapproveUser({
                sessionToken: sessionToken!,
                user: {
                    ID: user!.id,
                    バージョン: user!.version,
                },
            });

            if (!unapprovedUser) {
                throw new Error('ユーザーの承認解除に失敗しました');
            }

            await replica.transaction(
                'rw',
                replica.table('ユーザー'),
                async () => {
                    await replica.table('ユーザー').put(unapprovedUser);
                }
            );
        },
        onSuccess: () => {
            toast.success('ユーザーの承認を解除しました');
        },
        onError: () => {
            toast.error('ユーザーの承認解除に失敗しました');
        },
    });
};
