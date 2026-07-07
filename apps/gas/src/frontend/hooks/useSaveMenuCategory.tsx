import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useSaveMenuCategory = () => {
    const { sessionToken } = useAuth();
    return useMutation({
        mutationFn: async (input: {
            categories: {
                ID: string;
                名称: string;
                種別: string;
                バージョン: number;
            }[];
            deletedMenuCategoryIds: string[];
        }) => {
            const response = await server.saveMenuCategory({
                sessionToken: sessionToken!,
                menuCategories: input.categories,
                deletedMenuCategoryIds: input.deletedMenuCategoryIds,
            });
            replica.transaction(
                'rw',
                replica.table('メニューカテゴリー'),
                () => {
                    replica
                        .table('メニューカテゴリー')
                        .bulkPut(response.menuCategories);
                    replica
                        .table('メニューカテゴリー')
                        .bulkDelete(response.deletedMenuCategoryIds);
                }
            );
            return response;
        },
        onSuccess: () => {
            toast.success('メニューカテゴリーを保存しました');
        },
        onError: () => {
            toast.error('メニューカテゴリーの保存に失敗しました');
        },
    });
};
