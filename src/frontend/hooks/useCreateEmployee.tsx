import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateEmployeeInput } from '../../shared/api/employee';
import { useAuth } from './useAuth';

export const useCreateEmployee = () => {
    const { sessionToken } = useAuth();

    return useMutation({
        mutationFn: async (employeeData: CreateEmployeeInput['employee']) => {
            const { employee, user } = await server.createEmployee({
                sessionToken: sessionToken!,
                employee: employeeData,
            });

            replica.transaction(
                'rw',
                [replica.table('ユーザー'), replica.table('スタッフ')],
                () => {
                    replica.table('ユーザー').put(user);
                    replica.table('スタッフ').put(employee);
                }
            );
            return { employee, user };
        },
        onSuccess: () => {
            toast.success('スタッフを作成しました');
        },
        onError: () => {
            toast.error(`スタッフの作成に失敗しました`);
        },
    });
};
