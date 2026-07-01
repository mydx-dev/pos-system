import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { z } from 'zod';
import { context } from '../../../../tests/contexts/saveMenuCategoryTestContext';
import {
    saveMenuCategoryRequest,
    SaveMenuCategoryRequest,
} from '../../../shared/api/menuCategory';
import {
    MenuCategoryTable,
    UserTable,
} from '../../infrastructure/database/tables';

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            saveMenuCategory: { usecase },
        } = context();
        const input = zocker(saveMenuCategoryRequest).generate();
        expect(() =>
            usecase.execute(undefined as unknown as string, input)
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    it('システム管理者でない場合はエラー', () => {
        const {
            saveMenuCategory: { usecase },
            permissionCheckSpy: { hasRoleSpy },
        } = context();

        hasRoleSpy.mockReturnValue({ hasRole: false, user: null });
        const input = zocker(saveMenuCategoryRequest).generate();
        const userId = zocker(z.string().uuidv4()).generate();
        expect(() => usecase.execute(userId, input)).toThrow(ForbiddenError);
    });
});

describe('カテゴリー保存', () => {
    it('一つ目を更新・二つ目を削除・三つ目を新規作成', () => {
        const {
            saveMenuCategory: { usecase },
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

        const firstCategory = {
            ID: '11111111-1111-4111-8111-111111111111',
            名称: 'テストカテゴリ',
            種別: '技術',
            バージョン: 1,
        };

        const secondCategory = {
            ID: '22222222-2222-4222-8222-222222222222',
            名称: '削除カテゴリ',
            種別: '商品',
            バージョン: 1,
        };

        const thirdCategory = {
            ID: '',
            名称: '新規カテゴリ',
            種別: '商品',
            バージョン: 1,
        };

        const input: SaveMenuCategoryRequest = {
            sessionToken: 'session-token',
            menuCategories: [
                {
                    ...firstCategory,
                    名称: 'テストカテゴリー',
                },
                thirdCategory,
            ],
            deletedMenuCategoryIds: [secondCategory.ID],
        };

        const menuCategoryTableKey = `${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`;

        dataStore.set(menuCategoryTableKey, [
            ['ID', '名称', '種別', 'バージョン'],
            Object.values(firstCategory),
            Object.values(secondCategory),
        ]);

        usecase.execute('user-id', input);

        expect(upsertSpy).toHaveBeenCalledWith(
            [{ ...firstCategory, 名称: 'テストカテゴリー' }, thirdCategory].map(
                (category) => MenuCategoryTable.deserialize(category)
            )
        );
        expect(deleteSpy).toHaveBeenCalledWith(input.deletedMenuCategoryIds);

        const thirdCategoryId = getUuidSpy.mock.results[0].value;

        expect(dataStore.get(menuCategoryTableKey).rows).toEqual([
            [firstCategory.ID, 'テストカテゴリー', '技術', 2],
            [thirdCategoryId, '新規カテゴリ', '商品', 1],
        ]);
    });
    it('一つ目と二つ目を更新、３つ目はそのまま、削除はなし', () => {
        const {
            saveMenuCategory: { usecase },
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

        const firstCategory = {
            ID: '11111111-1111-4111-8111-111111111111',
            名称: 'カテゴリ１',
            種別: '技術',
            バージョン: 1,
        };

        const secondCategory = {
            ID: '22222222-2222-4222-8222-222222222222',
            名称: 'カテゴリ２',
            種別: '商品',
            バージョン: 3,
        };

        const thirdCategory = {
            ID: '33333333-3333-4333-8333-333333333333',
            名称: 'カテゴリ３',
            種別: '商品',
            バージョン: 5,
        };

        const input: SaveMenuCategoryRequest = {
            sessionToken: 'session-token',
            menuCategories: [
                {
                    ...firstCategory,
                    名称: 'カテゴリ１更新',
                },
                {
                    ...secondCategory,
                    名称: 'カテゴリ２更新',
                },
            ],
            deletedMenuCategoryIds: [],
        };

        const menuCategoryTableKey = `${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`;

        dataStore.set(menuCategoryTableKey, [
            ['ID', '名称', '種別', 'バージョン'],
            Object.values(firstCategory),
            Object.values(secondCategory),
            Object.values(thirdCategory),
        ]);

        usecase.execute('user-id', input);

        expect(upsertSpy).toHaveBeenCalledWith(
            input.menuCategories.map(MenuCategoryTable.deserialize)
        );
        expect(deleteSpy).not.toHaveBeenCalled();

        expect(dataStore.get(menuCategoryTableKey).rows).toEqual([
            [firstCategory.ID, 'カテゴリ１更新', '技術', 2],
            [secondCategory.ID, 'カテゴリ２更新', '商品', 4],
            [thirdCategory.ID, 'カテゴリ３', '商品', 5],
        ]);
    });

    it('一つ目を更新、二つ目はそのまま、三つ目を新規作成、削除はなし', () => {
        const {
            saveMenuCategory: { usecase },
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

        const firstCategory = {
            ID: '11111111-1111-4111-8111-111111111111',
            名称: 'カテゴリ１',
            種別: '技術',
            バージョン: 1,
        };

        const secondCategory = {
            ID: '22222222-2222-4222-8222-222222222222',
            名称: 'カテゴリ２',
            種別: '商品',
            バージョン: 3,
        };

        const thirdCategory = {
            ID: '',
            名称: '新規カテゴリ',
            種別: '技術',
            バージョン: 1,
        };

        const input: SaveMenuCategoryRequest = {
            sessionToken: 'session-token',
            menuCategories: [
                {
                    ...firstCategory,
                    名称: 'カテゴリ１更新',
                },
                thirdCategory,
            ],
            deletedMenuCategoryIds: [],
        };

        const menuCategoryTableKey = `${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`;

        dataStore.set(menuCategoryTableKey, [
            ['ID', '名称', '種別', 'バージョン'],
            Object.values(firstCategory),
            Object.values(secondCategory),
        ]);

        usecase.execute('user-id', input);

        expect(upsertSpy).toHaveBeenCalledWith(
            input.menuCategories.map(MenuCategoryTable.deserialize)
        );
        expect(deleteSpy).not.toHaveBeenCalled();

        const thirdCategoryId = getUuidSpy.mock.results[0].value;

        expect(dataStore.get(menuCategoryTableKey).rows).toEqual([
            [firstCategory.ID, 'カテゴリ１更新', '技術', 2],
            [secondCategory.ID, 'カテゴリ２', '商品', 3],
            [thirdCategoryId, '新規カテゴリ', '技術', 1],
        ]);
    });
});
