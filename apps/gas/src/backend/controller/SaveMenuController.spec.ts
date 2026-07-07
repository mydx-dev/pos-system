import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { context } from '../../../tests/contexts/saveMenuTestContext';
import { saveMenuRequest, saveMenuResponse } from '@mydx-pos/shared/api/menu';

describe('バリデーション', () => {
    it('セッショントークンが空の場合はエラー', () => {
        const {
            saveMenu: { controller },
        } = context();
        const input = zocker(saveMenuRequest).generate();
        input.sessionToken = undefined as unknown as string;
        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合は、エラーを返す', () => {
        const {
            saveMenu: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });
        const input = zocker(saveMenuRequest).generate();
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('メニュー保存成功', () => {
    it('メニュー保存ユースケースを呼び出す', () => {
        const {
            saveMenu: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveMenuRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        const response = zocker(saveMenuResponse).generate();
        usecaseSpy.mockReturnValue(response);
        const result = controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith('valid-user-id', input);
        expect(result).toEqual(new AppsScriptServerResponse(response));
    });
});

describe('メニュー保存失敗', () => {
    it('メニュー保存ユースケースでエラーが発生した場合は、エラーを返す', () => {
        const {
            saveMenu: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveMenuRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to save menus');
        });

        expect(() => controller.execute(input)).toThrow('Failed to save menus');
    });
});
