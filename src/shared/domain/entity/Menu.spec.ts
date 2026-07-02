import { describe, expect, it } from 'vitest';
import { Menu } from './Menu';

describe('初期化', () => {
    it('ID、名称、メニュー番号、価格、仕入れ単価、税区分、商品区分、種別、カテゴリーID、バージョンを指定して初期化できる', () => {
        const menu = new Menu(
            'menu-id',
            'カット',
            'M-001',
            5000,
            1000,
            '内税',
            '業務用',
            '技術',
            'category-id',
            1
        );

        expect(menu.id).toBe('menu-id');
        expect(menu.name).toBe('カット');
        expect(menu.menuNumber).toBe('M-001');
        expect(menu.price).toBe(5000);
        expect(menu.costPrice).toBe(1000);
        expect(menu.taxType).toBe('内税');
        expect(menu.productType).toBe('業務用');
        expect(menu.menuType).toBe('技術');
        expect(menu.categoryId).toBe('category-id');
        expect(menu.version).toBe(1);
    });
});

describe('pkValue', () => {
    it('IDを返す', () => {
        const menu = new Menu(
            'menu-id',
            'シャンプー',
            'P-001',
            2500,
            800,
            '外税',
            '店販用',
            '商品',
            'category-id',
            1
        );

        expect(menu.pkValue).toBe('menu-id');
    });
});
