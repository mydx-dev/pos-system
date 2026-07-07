import {
    productType,
    ProductType,
    taxType,
    TaxType,
} from '@mydx-pos/shared/domain/entity/Menu';
import { menuType, MenuType } from '@mydx-pos/shared/domain/entity/MenuCategory';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFindMenuCategory } from '@/hooks/useFindMenuCategory';
import { useMenuEditor } from '@/hooks/useMenuEditor';
import {
    AlertTriangle,
    Filter,
    Plus,
    Save,
    Search,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const numberValue = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const MenuListPage = () => {
    const [activeTab, setActiveTab] = useState<MenuType>(menuType[0]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const categories = useFindMenuCategory();
    const {
        menus,
        duplicateNames,
        hasChanges,
        hasInvalidMenus,
        isSaving,
        isLoading,
        update,
        add,
        remove,
        reset,
        save,
    } = useMenuEditor();

    const activeCategories = useMemo(
        () =>
            (categories ?? []).filter((category) => category.isType(activeTab)),
        [activeTab, categories]
    );

    const filteredMenus = useMemo(
        () =>
            menus
                .map((menu, index) => ({ menu, index }))
                .filter(({ menu }) => menu.isType(activeTab))
                .filter(
                    ({ menu }) =>
                        !categoryFilter || menu.categoryId === categoryFilter
                )
                .filter(({ menu }) =>
                    menu.name
                        .toLowerCase()
                        .includes(searchText.trim().toLowerCase())
                ),
        [activeTab, categoryFilter, menus, searchText]
    );

    const addMenu = () => {
        add(activeTab, activeCategories[0]?.id ?? '');
    };

    const isProductTab = activeTab === '商品';

    if (isLoading || !categories) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="font-body-md text-on-surface-variant">
                    メニュー情報を取得中...
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1440px] flex-col gap-lg px-md pb-32 pt-lg md:px-xl">
            <section className="flex flex-col gap-md md:flex-row md:items-end md:justify-between">
                <div>
                    <h2 className="font-display-lg text-display-lg text-primary">
                        メニュー管理
                    </h2>
                    <p className="mt-xs text-body-lg text-on-surface-variant">
                        施術メニューと販売商品の情報を一括で管理します。
                    </p>
                </div>
                <div className="flex flex-col gap-sm sm:flex-row">
                    <div className="relative min-w-[240px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                        <input
                            className="h-11 w-full rounded-full border border-transparent bg-surface-container-low py-2 pl-10 pr-4 text-body-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="メニューを検索..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(event.target.value)
                            }
                        />
                    </div>
                    <button
                        className="flex h-11 items-center justify-center gap-sm rounded-lg bg-primary px-lg text-on-primary shadow-sm transition-all hover:shadow-md active:scale-95"
                        onClick={addMenu}
                    >
                        <Plus className="size-4" />
                        <span className="font-label-lg text-label-lg">
                            メニューを追加
                        </span>
                    </button>
                </div>
            </section>

            <section className="flex flex-col gap-md border-b border-outline-variant md:flex-row md:items-end md:justify-between">
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => {
                        setActiveTab(value as MenuType);
                        setCategoryFilter('');
                    }}
                >
                    <TabsList className="border-none">
                        {menuType.map((type) => (
                            <TabsTrigger key={type} value={type}>
                                {type}メニュー
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <div className="flex items-center gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm md:mb-md">
                    <Filter className="size-4 text-on-surface-variant" />
                    <select
                        className="cursor-pointer border-none bg-transparent p-0 text-label-md outline-none focus:ring-0"
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    >
                        <option value="">全カテゴリー</option>
                        {activeCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(26,32,44,0.05)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-outline-variant bg-surface-container-low">
                                <th className="w-24 px-lg py-md font-label-lg text-on-surface-variant">
                                    No.
                                </th>
                                <th className="px-lg py-md font-label-lg text-on-surface-variant">
                                    メニュー名
                                </th>
                                <th className="w-48 px-lg py-md font-label-lg text-on-surface-variant">
                                    カテゴリー
                                </th>
                                <th className="w-40 px-lg py-md font-label-lg text-on-surface-variant">
                                    価格
                                </th>
                                <th className="w-36 px-lg py-md font-label-lg text-on-surface-variant">
                                    税区分
                                </th>
                                {isProductTab && (
                                    <>
                                        <th className="w-40 px-lg py-md font-label-lg text-on-surface-variant">
                                            仕入れ単価
                                        </th>
                                        <th className="w-40 px-lg py-md font-label-lg text-on-surface-variant">
                                            商品区分
                                        </th>
                                    </>
                                )}
                                <th className="w-16 px-lg py-md"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                            {filteredMenus.map(({ menu, index }) => (
                                <tr
                                    key={menu.id || `new-${index}`}
                                    className="group transition-colors hover:bg-surface-container-low"
                                >
                                    <td className="px-lg py-md">
                                        <input
                                            className="w-full border-none bg-transparent p-0 text-center text-body-sm outline-none focus:ring-0"
                                            value={menu.menuNumber}
                                            onChange={(event) =>
                                                update(index, {
                                                    menuNumber:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-lg py-md min-w-[200px]">
                                        <input
                                            className="w-full border-none bg-transparent p-0 text-body-md font-semibold text-primary outline-none focus:ring-0"
                                            value={menu.name}
                                            onChange={(event) =>
                                                update(index, {
                                                    name: event.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-lg py-md min-w-[200px]">
                                        <select
                                            className="w-full border-none bg-transparent p-0 text-body-sm outline-none focus:ring-0"
                                            value={menu.categoryId}
                                            onChange={(event) =>
                                                update(index, {
                                                    categoryId:
                                                        event.target.value,
                                                })
                                            }
                                        >
                                            <option value="">未選択</option>
                                            {activeCategories.map(
                                                (category) => (
                                                    <option
                                                        key={category.id}
                                                        value={category.id}
                                                    >
                                                        {category.name}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </td>
                                    <td className="px-lg py-md">
                                        <div className="flex items-center">
                                            <span className="mr-1 text-body-sm font-medium">
                                                ¥
                                            </span>
                                            <input
                                                className="w-full border-none bg-transparent p-0 text-body-md outline-none focus:ring-0"
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={menu.price}
                                                onChange={(event) =>
                                                    update(index, {
                                                        price: numberValue(
                                                            event.target.value
                                                        ),
                                                    })
                                                }
                                            />
                                        </div>
                                    </td>
                                    <td className="px-lg py-md">
                                        <select
                                            className="w-full border-none bg-transparent p-0 text-body-sm outline-none focus:ring-0"
                                            value={menu.taxType}
                                            onChange={(event) =>
                                                update(index, {
                                                    taxType: event.target
                                                        .value as TaxType,
                                                })
                                            }
                                        >
                                            {taxType.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    {isProductTab && (
                                        <>
                                            <td className="px-lg py-md">
                                                <div className="flex items-center">
                                                    <span className="mr-1 text-body-sm font-medium">
                                                        ¥
                                                    </span>
                                                    <input
                                                        className="w-full border-none bg-transparent p-0 text-body-md outline-none focus:ring-0"
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        value={menu.costPrice}
                                                        onChange={(event) =>
                                                            update(index, {
                                                                costPrice:
                                                                    numberValue(
                                                                        event
                                                                            .target
                                                                            .value
                                                                    ),
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-lg py-md">
                                                <select
                                                    className="w-full border-none bg-transparent p-0 text-body-sm outline-none focus:ring-0"
                                                    value={menu.productType}
                                                    onChange={(event) =>
                                                        update(index, {
                                                            productType: event
                                                                .target
                                                                .value as ProductType,
                                                        })
                                                    }
                                                >
                                                    {productType.map((type) => (
                                                        <option
                                                            key={type}
                                                            value={type}
                                                        >
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </>
                                    )}
                                    <td className="px-lg py-md text-right">
                                        <button
                                            className="rounded p-1 text-error opacity-100 transition-all hover:bg-error-container md:opacity-0 md:group-hover:opacity-100"
                                            aria-label="メニューを削除"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredMenus.length === 0 && (
                    <div className="flex min-h-48 items-center justify-center border-t border-outline-variant">
                        <p className="text-body-md text-on-surface-variant">
                            表示できるメニューがありません
                        </p>
                    </div>
                )}
            </section>

            {duplicateNames.length > 0 && (
                <div className="flex items-center gap-sm rounded-lg border border-error/20 bg-error-container/30 p-md text-error">
                    <AlertTriangle className="size-5" />
                    <p className="text-body-sm font-medium">
                        重複したメニュー名が検出されました。保存前に確認してください。
                    </p>
                </div>
            )}

            <footer className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-50 flex items-center justify-end gap-lg border-t border-outline-variant bg-surface-container-lowest p-lg shadow-[0_-12px_32px_-4px_rgba(0,32,69,0.08)]">
                <button
                    className="rounded-lg px-lg py-md font-label-lg text-on-surface-variant transition-all hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-50"
                    disabled={!hasChanges || isSaving}
                    onClick={reset}
                >
                    キャンセル
                </button>
                <button
                    className="flex items-center gap-sm rounded-lg bg-primary px-xl py-md font-label-lg text-on-primary shadow-sm transition-all hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                    disabled={
                        !hasChanges ||
                        isSaving ||
                        hasInvalidMenus ||
                        duplicateNames.length > 0
                    }
                    onClick={() => save()}
                >
                    <Save className="size-4" />
                    変更を保存
                </button>
            </footer>
        </div>
    );
};
