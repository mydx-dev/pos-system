import { CreatePaymentRecordRequest } from '@/../shared/api/paymentRecord';
import { registerReplica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRegisterTerminalAuth } from './useRegisterTerminalAuth';

export const useCreatePaymentRecord = () => {
    const { registerTerminalToken } = useRegisterTerminalAuth();

    return useMutation({
        mutationFn: async (
            paymentRecord: CreatePaymentRecordRequest['paymentRecord']
        ) => {
            if (!registerTerminalToken) {
                throw new Error('Register terminal token is required');
            }

            const response = await server.createPaymentRecord({
                registerTerminalToken,
                paymentRecord,
            });

            await registerReplica.transaction(
                'rw',
                [
                    registerReplica.table('精算履歴'),
                    registerReplica.table('施術'),
                ],
                async () => {
                    await registerReplica
                        .table('精算履歴')
                        .put(response.paymentRecord);

                    if (response.treatment) {
                        const currentTreatment = await registerReplica
                            .table('施術')
                            .get(response.treatment.ID);

                        if (currentTreatment) {
                            await registerReplica.table('施術').put({
                                ...currentTreatment,
                                状態: response.treatment.状態,
                                バージョン: response.treatment.バージョン,
                            });
                        }
                    }
                }
            );

            return response;
        },
        onSuccess: () => {
            toast.success('精算履歴を登録しました');
        },
        onError: () => {
            toast.error('精算履歴の登録に失敗しました');
        },
    });
};
