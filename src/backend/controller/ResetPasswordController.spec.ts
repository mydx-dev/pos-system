import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/resetPasswordTestContext';

describe('バリデーション', () => {
    it('トークンがなければパスワードをリセットできない', () => {
        const {
            resetPassword: { controller },
        } = context();
        expect(() =>
            controller.execute({
                token: undefined as unknown as string,
                newPassword: 'newpassword',
            })
        ).toThrow(ZodError);
    });
});

describe('ユースケースの呼び出し', () => {
    const {
        resetPassword: { usecaseSpy, controller },
    } = context();
    it('ユースケースが正常に呼び出される', () => {
        usecaseSpy.mockReturnValue({ ok: true });
        controller.execute({
            token: 'validToken',
            newPassword: 'newpassword',
        });
        expect(usecaseSpy).toHaveBeenCalledWith('validToken', 'newpassword');
    });
    it('ユースケースの呼び出しに失敗した場合、エラーを返す', () => {
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to reset password');
        });
        expect(() =>
            controller.execute({
                token: 'validToken',
                newPassword: 'newpassword',
            })
        ).toThrow('Failed to reset password');
    });
    it('ユースケースが正常に完了した場合、成功のレスポンスを返す', () => {
        usecaseSpy.mockReturnValue({ ok: true });
        const response = controller.execute({
            token: 'validToken',
            newPassword: 'newpassword',
        });
        expect(response).toEqual(new AppsScriptServerResponse({ ok: true }));
    });
});
