import { useEffect, useMemo, useState } from 'react';
import {
    MenuCategory,
    MenuType,
} from '@mydx-pos/shared/domain/entity/MenuCategory';
import { useFindMenuCategory } from './useFindMenuCategory';
import { useSaveMenuCategory } from './useSaveMenuCategory';

export const useMenuCategoryEditor = () => {
    const initial = useFindMenuCategory();
    const saveMutation = useSaveMenuCategory();

    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    // 初回ロード
    useEffect(() => {
        if (!initial) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCategories(initial);
        setDeletedIds([]);
    }, [initial]);

    const updateName = (index: number, name: string) => {
        setCategories((prev) =>
            prev.map((c, i) =>
                i === index
                    ? new MenuCategory(c.id, name, c.menuType, c.version)
                    : c
            )
        );
    };

    const remove = (index: number) => {
        setCategories((prev) => {
            const target = prev[index];

            if (target?.id) {
                setDeletedIds((ids) => [...ids, target.id]);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    const add = (type: MenuType) => {
        setCategories((prev) => [...prev, new MenuCategory('', '', type, 1)]);
    };

    const save = async () => {
        await saveMutation.mutateAsync({
            categories: categories.map((c) => ({
                ID: c.id,
                名称: c.name,
                種別: c.menuType,
                バージョン: c.version,
            })),
            deletedMenuCategoryIds: deletedIds,
        });

        setDeletedIds([]);
    };

    const hasChanges = useMemo(() => {
        if (!initial) return false;

        if (deletedIds.length > 0) return true;

        if (categories.length !== initial.length) return true;

        return (
            JSON.stringify(
                categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.menuType,
                    version: c.version,
                }))
            ) !==
            JSON.stringify(
                initial.map((c) => ({
                    id: c.id,
                    name: c.name,
                    type: c.menuType,
                    version: c.version,
                }))
            )
        );
    }, [categories, deletedIds, initial]);

    return {
        categories,
        hasChanges,
        isSaving: saveMutation.isPending,

        updateName,
        add,
        remove,
        save,
    };
};
