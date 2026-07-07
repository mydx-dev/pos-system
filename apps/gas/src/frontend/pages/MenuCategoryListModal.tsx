import { menuType, MenuType } from '@mydx-pos/shared/domain/entity/MenuCategory';
import { CategoryItem } from '@/components/menu/CategoryItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { useMenuCategoryEditor } from '../hooks/useMenuCategoryEditor';

export const MenuCategoryListModal = () => {
    const [activeTab, setActiveTab] = useState<MenuType>(menuType[0]);
    const { categories, hasChanges, isSaving, updateName, add, remove, save } =
        useMenuCategoryEditor();

    return (
        <div className="fixed inset-0 modal-overlay z-40 flex items-center justify-center p-md">
            {/* Modal Container */}
            <div className="bg-surface-container-lowest w-full max-w-[600px] rounded-xl shadow-xl flex flex-col max-h-[921px] overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <header className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
                    <h2 className="font-headline-md text-headline-md text-primary">
                        カテゴリー管理
                    </h2>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:scale-95">
                        <span className="material-symbols-outlined text-on-surface-variant">
                            close
                        </span>
                    </button>
                </header>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="px-lg mt-md"
                >
                    <TabsList className="flex w-full border-b border-outline-variant">
                        {menuType.map((label, index) => (
                            <TabsTrigger
                                key={index}
                                value={label}
                                className="p-lg"
                            >
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {menuType.map((label, index) => (
                        <TabsContent
                            key={index}
                            value={label}
                            className="flex flex-col gap-md mt-md overflow-y-auto max-h-[300px]"
                        >
                            {categories
                                ?.map((category, index) => ({
                                    category,
                                    index,
                                }))
                                .filter(({ category }) =>
                                    category.isType(label)
                                )
                                .map(({ category, index }) => (
                                    <CategoryItem
                                        key={category.id || `new-${index}`}
                                        value={category.name}
                                        onChange={(e) =>
                                            updateName(index, e.target.value)
                                        }
                                        onDelete={() => remove(index)}
                                    />
                                ))}
                        </TabsContent>
                    ))}
                </Tabs>
                {/* List Area (Dynamic Content) */}
                <div
                    className="flex-1 overflow-y-auto px-lg py-md custom-scrollbar"
                    id="category-list-container"
                >
                    {/* Add Action */}
                    <div className="mt-md">
                        <button
                            className="w-full flex items-center justify-center gap-sm py-md border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:border-primary hover:text-primary transition-all cursor-pointer group active:scale-[0.98]"
                            onClick={() => {
                                add(activeTab);
                            }}
                        >
                            <span className="material-symbols-outlined text-body-md">
                                add_circle
                            </span>
                            <span className="font-label-lg text-label-lg">
                                カテゴリーを追加
                            </span>
                        </button>
                    </div>
                </div>
                {/* Footer */}
                <footer className="flex items-center justify-end gap-md px-lg py-lg bg-surface border-t border-outline-variant">
                    <button className="px-lg py-md rounded-lg font-label-lg text-label-lg text-primary border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-high transition-all cursor-pointer active:scale-95">
                        キャンセル
                    </button>
                    <button
                        className="px-xl py-md rounded-lg font-label-lg text-label-lg bg-primary-container text-on-primary shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 hover:bg-primary-container/80 disabled:opacity-50 disabled:pointer-events-none"
                        disabled={!hasChanges || isSaving}
                        onClick={() => save()}
                    >
                        変更を保存
                    </button>
                </footer>
            </div>
        </div>
    );
};
