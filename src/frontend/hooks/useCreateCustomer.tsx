import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CreateCustomerInput } from '../../shared/api/customer';
import { useAuth } from './useAuth';

export const useCreateCustomer = () => {
    const { sessionToken } = useAuth();

    return useMutation({
        mutationFn: async (customerData: CreateCustomerInput['customer']) => {
            const { customer } = await server.createCustomer({
                sessionToken: sessionToken!,
                customer: customerData,
            });

            await replica.transaction('rw', [replica.table('顧客')], () => {
                replica.table('顧客').put(customer);
            });

            return customer;
        },
        onSuccess: () => {
            toast.success('顧客を登録しました');
        },
        onError: () => {
            toast.error('顧客の登録に失敗しました');
        },
    });
};
