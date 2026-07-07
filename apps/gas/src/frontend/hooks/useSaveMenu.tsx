import { ProductType, TaxType } from '@mydx-pos/shared/domain/entity/Menu';
import { MenuType } from '@mydx-pos/shared/domain/entity/MenuCategory';
import { replica, server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useSaveMenu = () => {
    const { sessionToken } = useAuth();
    return useMutation({
        mutationFn: async (input: {
            menus: {
                ID: string;
                名称: string;
                メニュー番号: string;
                価格: number;
                仕入れ単価: number;
                税区分: TaxType;
                商品区分: ProductType;
                種別: MenuType;
                カテゴリーID: string;
                バージョン: number;
            }[];
            deletedMenuIds: string[];
        }) => {
            const response = await server.saveMenu({
                sessionToken: sessionToken!,
                menus: input.menus,
                deletedMenuIds: input.deletedMenuIds,
            });
            await replica.transaction('rw', replica.table('メニュー'), () => {
                replica.table('メニュー').bulkPut(response.menus);
                replica.table('メニュー').bulkDelete(response.deletedMenuIds);
            });
            return response;
        },
        onSuccess: () => {
            toast.success('メニューを保存しました');
        },
        onError: () => {
            toast.error('メニューの保存に失敗しました');
        },
    });
};
