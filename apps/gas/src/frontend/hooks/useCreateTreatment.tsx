import { CreateTreatmentRequest } from '@/../shared/api/treatment';
import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useCreateTreatment = () => {
    const { sessionToken } = useAuth();

    return useMutation({
        mutationFn: async (
            input: Pick<CreateTreatmentRequest, 'treatment' | 'treatmentMenus'>
        ) => {
            const response = await server.createTreatment({
                sessionToken: sessionToken!,
                treatment: input.treatment,
                treatmentMenus: input.treatmentMenus,
            });

            const { 終了日時, ...treatment } = response.treatment;
            await replica.transaction(
                'rw',
                [replica.table('施術'), replica.table('施術メニュー')],
                () => {
                    void 終了日時;
                    replica.table('施術').put(treatment);
                    replica
                        .table('施術メニュー')
                        .bulkPut(response.treatmentMenus);
                }
            );

            return response;
        },
        onSuccess: () => {
            toast.success('施術を登録しました');
        },
        onError: () => {
            toast.error('施術の登録に失敗しました');
        },
    });
};
