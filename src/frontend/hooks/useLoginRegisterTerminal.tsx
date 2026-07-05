import { server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoginRegisterTerminalRequest } from '../../shared/api/registerTerminal';
import { useRegisterTerminalAuth } from './useRegisterTerminalAuth';

export const registerTerminalTokenStorageKey = 'registerTerminalToken';

export const useLoginRegisterTerminal = () => {
    const { login, logout } = useRegisterTerminalAuth();

    return useMutation({
        mutationFn: async (input: LoginRegisterTerminalRequest) => {
            return await server.loginRegisterTerminal(input);
        },
        onSuccess: (_response, input) => {
            login(input.token);
            toast.success('レジ端末を認証しました');
        },
        onError: async () => {
            await logout();
            toast.error('レジ端末の認証に失敗しました');
        },
    });
};
