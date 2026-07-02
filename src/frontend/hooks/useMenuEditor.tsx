import { Menu, ProductType, TaxType } from '@/../shared/domain/entity/Menu';
import { MenuType } from '@/../shared/domain/entity/MenuCategory';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useFindMenu } from './useFindMenu';
import { useSaveMenu } from './useSaveMenu';

type MenuPatch = Partial<{
    name: string;
    menuNumber: string;
    price: number;
    costPrice: number;
    taxType: TaxType;
    productType: ProductType;
    menuType: MenuType;
    categoryId: string;
}>;

const toComparable = (menus: Menu[]) =>
    menus.map((menu) => ({
        id: menu.id,
        name: menu.name,
        menuNumber: menu.menuNumber,
        price: menu.price,
        costPrice: menu.costPrice,
        taxType: menu.taxType,
        productType: menu.productType,
        menuType: menu.menuType,
        categoryId: menu.categoryId,
        version: menu.version,
    }));

const updateMenu = (menu: Menu, patch: MenuPatch) =>
    new Menu(
        menu.id,
        patch.name ?? menu.name,
        patch.menuNumber ?? menu.menuNumber,
        patch.price ?? menu.price,
        patch.costPrice ?? menu.costPrice,
        patch.taxType ?? menu.taxType,
        patch.productType ?? menu.productType,
        patch.menuType ?? menu.menuType,
        patch.categoryId ?? menu.categoryId,
        menu.version
    );

const hasInvalidMenu = (menu: Menu) =>
    !menu.name.trim() ||
    !menu.categoryId ||
    !Number.isInteger(menu.price) ||
    !Number.isInteger(menu.costPrice);

const serializeMenus = (menus: Menu[]) =>
    menus.map((menu) => ({
        ID: menu.id,
        名称: menu.name,
        メニュー番号: menu.menuNumber,
        価格: menu.price,
        仕入れ単価: menu.costPrice,
        税区分: menu.taxType,
        商品区分: menu.productType,
        種別: menu.menuType,
        カテゴリーID: menu.categoryId,
        バージョン: menu.version,
    }));

export const useMenuEditor = () => {
    const initial = useFindMenu();
    const saveMutation = useSaveMenu();

    const [menus, setMenus] = useState<Menu[]>([]);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    useEffect(() => {
        if (!initial) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMenus(initial);
        setDeletedIds([]);
    }, [initial]);

    const update = (index: number, patch: MenuPatch) => {
        setMenus((prev) =>
            prev.map((menu, i) =>
                i === index ? updateMenu(menu, patch) : menu
            )
        );
    };

    const remove = (index: number) => {
        setMenus((prev) => {
            const target = prev[index];

            if (target?.id) {
                setDeletedIds((ids) => [...ids, target.id]);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    const add = (type: MenuType, categoryId = '') => {
        setMenus((prev) => [
            ...prev,
            new Menu('', '', '', 0, 0, '内税', '業務用', type, categoryId, 1),
        ]);
    };

    const reset = () => {
        setMenus(initial ?? []);
        setDeletedIds([]);
    };

    const duplicateNames = useMemo(() => {
        const names = menus
            .map((menu) => menu.name.trim())
            .filter((name) => name.length > 0);
        return names.filter((name, index) => names.indexOf(name) !== index);
    }, [menus]);

    const hasInvalidMenus = useMemo(() => {
        return menus.some(hasInvalidMenu);
    }, [menus]);

    const save = async () => {
        if (hasInvalidMenus) {
            toast.error('未入力の項目があります');
            return;
        }

        await saveMutation.mutateAsync({
            menus: serializeMenus(menus),
            deletedMenuIds: deletedIds,
        });

        setDeletedIds([]);
    };

    const hasChanges = useMemo(() => {
        if (!initial) return false;

        if (deletedIds.length > 0) return true;
        if (menus.length !== initial.length) return true;

        return (
            JSON.stringify(toComparable(menus)) !==
            JSON.stringify(toComparable(initial))
        );
    }, [deletedIds, initial, menus]);

    return {
        menus,
        duplicateNames,
        hasChanges,
        hasInvalidMenus,
        isSaving: saveMutation.isPending,
        isLoading: !initial,

        update,
        add,
        remove,
        reset,
        save,
    };
};
