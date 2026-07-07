import { server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateRegisterTerminalRequest } from '../../shared/api/registerTerminal';
import { useAuth } from './useAuth';

export const useCreateRegisterTerminal = () => {
    const { sessionToken } = useAuth();

    return useMutation({
        mutationFn: async (
            terminal: CreateRegisterTerminalRequest['terminal']
        ) => {
            return await server.createRegisterTerminal({
                sessionToken: sessionToken!,
                terminal,
            });
        },
        onSuccess: () => {
            toast.success('レジ端末を登録しました');
        },
        onError: () => {
            toast.error('レジ端末の登録に失敗しました');
        },
    });
};
