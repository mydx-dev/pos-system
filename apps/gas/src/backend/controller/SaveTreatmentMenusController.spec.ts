import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { context } from '../../../tests/contexts/saveTreatmentMenusTestContext';
import {
    saveTreatmentMenusRequest,
    saveTreatmentMenusResponse,
} from '@mydx-pos/shared/api/treatment';

describe('バリデーション', () => {
    it('セッショントークンが空の場合はエラー', () => {
        const {
            saveTreatmentMenus: { controller },
        } = context();
        const input = zocker(saveTreatmentMenusRequest).generate();
        input.sessionToken = undefined as unknown as string;
        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合は、エラーを返す', () => {
        const {
            saveTreatmentMenus: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });
        const input = zocker(saveTreatmentMenusRequest).generate();
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('施術メニュー保存成功', () => {
    it('施術メニュー保存ユースケースを呼び出す', () => {
        const {
            saveTreatmentMenus: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveTreatmentMenusRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        const response = zocker(saveTreatmentMenusResponse).generate();
        usecaseSpy.mockReturnValue(response);
        const result = controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith('valid-user-id', input);
        expect(result).toEqual(new AppsScriptServerResponse(response));
    });
});

describe('施術メニュー保存失敗', () => {
    it('施術メニュー保存ユースケースでエラーが発生した場合は、エラーを返す', () => {
        const {
            saveTreatmentMenus: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = zocker(saveTreatmentMenusRequest).generate();

        authSpy.mockReturnValue('valid-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to save treatment menus');
        });

        expect(() => controller.execute(input)).toThrow(
            'Failed to save treatment menus'
        );
    });
});
