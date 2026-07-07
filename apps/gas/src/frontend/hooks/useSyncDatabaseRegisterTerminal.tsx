import { registerReplica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { routes } from '../../shared/routes';
import { useRegisterTerminalAuth } from './useRegisterTerminalAuth';
import { mergeDatabase } from './useSyncDatabase';

export const useSyncDatabaseRegisterTerminal = () => {
    const { registerTerminalToken, logout } = useRegisterTerminalAuth();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            if (!registerTerminalToken) {
                throw new Error('Register terminal token is required');
            }

            const remoteDatabase = await server.pullDatabaseRegisterTerminal({
                registerTerminalToken,
            });
            await mergeDatabase(registerReplica, remoteDatabase);
            return remoteDatabase;
        },
        onSuccess: () => {
            toast.success('レジ端末データの同期が完了しました');
        },
        onError: async () => {
            await logout();
            toast.error('レジ端末データの同期に失敗しました');
            navigate(routes.register.login, { replace: true });
        },
    });
};
