import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/logoutUserTestContext';

describe('ログアウト', () => {
    it('セッショントークンがない場合はエラーになる', () => {
        const {
            logoutUser: { controller },
        } = context();
        expect(() => controller.execute(undefined as any)).toThrow(ZodError);
    });

    it('ログアウト処理を呼び出す', () => {
        const sessionToken = 'valid-session-token';
        const {
            logoutUser: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValueOnce({ ok: true });

        controller.execute(sessionToken);
        expect(usecaseSpy).toHaveBeenCalledWith(sessionToken);
    });

    it('ログアウト処理が成功した場合、OK:trueを返す', () => {
        const sessionToken = 'valid-session-token';
        const {
            logoutUser: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValueOnce({ ok: true });

        const response = controller.execute(sessionToken);
        expect(response).toEqual(new AppsScriptServerResponse({ ok: true }));
    });

    it('ログアウト処理に失敗した場合、適切なエラーになる', () => {
        const sessionToken = 'valid-session-token';
        const {
            logoutUser: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockImplementation(() => {
            throw new Error('Logout failed');
        });

        expect(() => controller.execute(sessionToken)).toThrow('Logout failed');
    });
});
