import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { context } from '../../../tests/contexts/saveMenuCategoryTestContext';
import {
    saveMenuCategoryRequest,
    saveMenuCategoryResponse,
} from '../../shared/api/menuCategory';

describe('バリデーション', () => {
    it('セッショントークンが空の場合はエラー', () => {
        const {
            saveMenuCategory: { controller },
        } = context();
        const input = zocker(saveMenuCategoryRequest).generate();
        input.sessionToken = undefined as unknown as string;
        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合は、エラーを返す', () => {
        const {
            saveMenuCategory: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });
        const input = zocker(saveMenuCategoryRequest).generate();
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('カテゴリー保存成功', () => {
    it('カテゴリー保存ユースケースを呼び出す', () => {
        const {
            saveMenuCategory: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveMenuCategoryRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        const response = zocker(saveMenuCategoryResponse).generate();
        usecaseSpy.mockReturnValue(response);
        const result = controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith('valid-user-id', input);
        expect(result).toEqual(new AppsScriptServerResponse(response));
    });
});

describe('カテゴリー保存失敗', () => {
    it('カテゴリー保存ユースケースでエラーが発生した場合は、エラーを返す', () => {
        const {
            saveMenuCategory: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveMenuCategoryRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to save menu categories');
        });

        expect(() => controller.execute(input)).toThrow(
            'Failed to save menu categories'
        );
    });
});
