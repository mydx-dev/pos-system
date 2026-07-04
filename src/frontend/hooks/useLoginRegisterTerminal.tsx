import { server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoginRegisterTerminalRequest } from '../../shared/api/registerTerminal';

export const registerTerminalTokenStorageKey = 'registerTerminalToken';

export const useLoginRegisterTerminal = () => {
    return useMutation({
        mutationFn: async (input: LoginRegisterTerminalRequest) => {
            return await server.loginRegisterTerminal(input);
        },
        onSuccess: (_response, input) => {
            localStorage.setItem(registerTerminalTokenStorageKey, input.token);
            toast.success('レジ端末を認証しました');
        },
        onError: () => {
            localStorage.removeItem(registerTerminalTokenStorageKey);
            toast.error('レジ端末の認証に失敗しました');
        },
    });
};
