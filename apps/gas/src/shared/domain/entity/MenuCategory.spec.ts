import { describe, expect, it } from 'vitest';
import { MenuCategory } from './MenuCategory';

describe('初期化', () => {
    it('ID、名称、種別、バージョンを指定して初期化できる', () => {
        const id = 'category-id';
        const name = 'カテゴリ名';
        const menuType = '技術' as const;
        const version = 1;

        const category = new MenuCategory(id, name, menuType, version);

        expect(category.id).toBe(id);
        expect(category.name).toBe(name);
        expect(category.menuType).toBe(menuType);
        expect(category.version).toBe(version);
    });
});

describe('pkValue', () => {
    it('IDを返す', () => {
        const id = 'category-id';
        const name = 'カテゴリ名';
        const menuType = '商品' as const;
        const version = 1;

        const category = new MenuCategory(id, name, menuType, version);

        expect(category.pkValue).toBe(id);
    });
});
