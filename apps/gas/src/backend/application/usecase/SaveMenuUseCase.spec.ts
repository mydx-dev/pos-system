import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { z } from 'zod';
import { context } from '../../../../tests/contexts/saveMenuTestContext';
import { saveMenuRequest, SaveMenuRequest } from '@mydx-pos/shared/api/menu';
import {
    MenuCategoryTable,
    MenuTable,
    UserTable,
} from '../../infrastructure/database/tables';

const category = {
    ID: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    名称: 'カット',
    種別: '技術',
    バージョン: 1,
} as const;

function setCategory(dataStore: ReturnType<typeof context>['dataStore']) {
    dataStore.set(`${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`, [
        ['ID', '名称', '種別', 'バージョン'],
        Object.values(category),
    ]);
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            saveMenu: { usecase },
        } = context();
        const input = zocker(saveMenuRequest).generate();
        expect(() =>
            usecase.execute(undefined as unknown as string, input)
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    it('システム管理者でない場合はエラー', () => {
        const {
            saveMenu: { usecase },
            permissionCheckSpy: { hasRoleSpy },
        } = context();

        hasRoleSpy.mockReturnValue({ hasRole: false, user: null });
        const input = zocker(saveMenuRequest).generate();
        const userId = zocker(z.string().uuidv4()).generate();
        expect(() => usecase.execute(userId, input)).toThrow(ForbiddenError);
    });
});

describe('メニュー保存', () => {
    it('一つ目を更新・二つ目を削除・三つ目を新規作成', () => {
        const {
            saveMenu: { usecase },
            permissionCheckSpy: { hasRoleSpy },
            dbSpy: { upsertSpy, deleteSpy },
            dataStore,
            getUuidSpy,
        } = context();

        const me = UserTable.deserialize({
            ID: 'user-id',
            氏名: 'テスト',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: true,
            バージョン: 1,
        });
        hasRoleSpy.mockReturnValue({ hasRole: true, user: me });
        setCategory(dataStore);

        const firstMenu = {
            ID: '11111111-1111-4111-8111-111111111111',
            名称: 'カット',
            メニュー番号: 'T-001',
            価格: 5000,
            仕入れ単価: 1000,
            税区分: '内税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 1,
        } as const;

        const secondMenu = {
            ID: '22222222-2222-4222-8222-222222222222',
            名称: '削除メニュー',
            メニュー番号: 'T-002',
            価格: 3000,
            仕入れ単価: 500,
            税区分: '外税',
            商品区分: '両用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 1,
        } as const;

        const thirdMenu = {
            ID: '',
            名称: '前髪カット',
            メニュー番号: 'T-003',
            価格: 1500,
            仕入れ単価: 0,
            税区分: '内税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 1,
        } as const;

        const input: SaveMenuRequest = {
            sessionToken: 'session-token',
            menus: [
                {
                    ...firstMenu,
                    名称: 'カット更新',
                    価格: 5500,
                },
                thirdMenu,
            ],
            deletedMenuIds: [secondMenu.ID],
        };

        const menuTableKey = `${MenuTable.dbId}:${MenuTable.name}`;

        dataStore.set(menuTableKey, [
            [
                'ID',
                '名称',
                'メニュー番号',
                '価格',
                '仕入れ単価',
                '税区分',
                '商品区分',
                '種別',
                'カテゴリーID',
                'バージョン',
            ],
            Object.values(firstMenu),
            Object.values(secondMenu),
        ]);

        usecase.execute('user-id', input);

        expect(upsertSpy).toHaveBeenCalledWith(
            [{ ...firstMenu, 名称: 'カット更新', 価格: 5500 }, thirdMenu].map(
                (menu) => MenuTable.deserialize(menu)
            )
        );
        expect(deleteSpy).toHaveBeenCalledWith(input.deletedMenuIds);

        const thirdMenuId = getUuidSpy.mock.results[0].value;

        expect(dataStore.get(menuTableKey).rows).toEqual([
            [
                firstMenu.ID,
                'カット更新',
                'T-001',
                5500,
                1000,
                '内税',
                '業務用',
                '技術',
                category.ID,
                2,
            ],
            [
                thirdMenuId,
                '前髪カット',
                'T-003',
                1500,
                0,
                '内税',
                '業務用',
                '技術',
                category.ID,
                1,
            ],
        ]);
    });

    it('一つ目と二つ目を更新、三つ目はそのまま、削除はなし', () => {
        const {
            saveMenu: { usecase },
            permissionCheckSpy: { hasRoleSpy },
            dbSpy: { upsertSpy, deleteSpy },
            dataStore,
        } = context();

        const me = UserTable.deserialize({
            ID: 'user-id',
            氏名: 'テスト',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: true,
            バージョン: 1,
        });
        hasRoleSpy.mockReturnValue({ hasRole: true, user: me });
        setCategory(dataStore);

        const firstMenu = {
            ID: '11111111-1111-4111-8111-111111111111',
            名称: 'カット',
            メニュー番号: 'T-001',
            価格: 5000,
            仕入れ単価: 1000,
            税区分: '内税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 1,
        } as const;

        const secondMenu = {
            ID: '22222222-2222-4222-8222-222222222222',
            名称: '縮毛矯正',
            メニュー番号: 'T-002',
            価格: 15000,
            仕入れ単価: 2500,
            税区分: '外税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 3,
        } as const;

        const thirdMenu = {
            ID: '33333333-3333-4333-8333-333333333333',
            名称: '前髪矯正',
            メニュー番号: 'T-003',
            価格: 6000,
            仕入れ単価: 1000,
            税区分: '内税',
            商品区分: '業務用',
            種別: '技術',
            カテゴリーID: category.ID,
            バージョン: 5,
        } as const;

        const input: SaveMenuRequest = {
            sessionToken: 'session-token',
            menus: [
                {
                    ...firstMenu,
                    名称: 'カット更新',
                },
                {
                    ...secondMenu,
                    価格: 16000,
                },
            ],
            deletedMenuIds: [],
        };

        const menuTableKey = `${MenuTable.dbId}:${MenuTable.name}`;

        dataStore.set(menuTableKey, [
            [
                'ID',
                '名称',
                'メニュー番号',
                '価格',
                '仕入れ単価',
                '税区分',
                '商品区分',
                '種別',
                'カテゴリーID',
                'バージョン',
            ],
            Object.values(firstMenu),
            Object.values(secondMenu),
            Object.values(thirdMenu),
        ]);

        usecase.execute('user-id', input);

        expect(upsertSpy).toHaveBeenCalledWith(
            input.menus.map(MenuTable.deserialize)
        );
        expect(deleteSpy).not.toHaveBeenCalled();

        expect(dataStore.get(menuTableKey).rows).toEqual([
            [
                firstMenu.ID,
                'カット更新',
                'T-001',
                5000,
                1000,
                '内税',
                '業務用',
                '技術',
                category.ID,
                2,
            ],
            [
                secondMenu.ID,
                '縮毛矯正',
                'T-002',
                16000,
                2500,
                '外税',
                '業務用',
                '技術',
                category.ID,
                4,
            ],
            [
                thirdMenu.ID,
                '前髪矯正',
                'T-003',
                6000,
                1000,
                '内税',
                '業務用',
                '技術',
                category.ID,
                5,
            ],
        ]);
    });
});
