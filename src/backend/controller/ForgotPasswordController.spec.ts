import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/forgotPasswordTestContext';

describe('バリデーション', () => {
    it('メールアドレスがない場合、エラーになる', () => {
        const {
            forgotPassword: { controller },
        } = context();
        expect(() =>
            controller.execute({
                email: undefined as unknown as string,
            })
        ).toThrow(ZodError);
    });
});

describe('ユースケース呼び出し', () => {
    it('パスワード忘れユースケースにメールアドレスを入れて呼び出す', () => {
        const {
            forgotPassword: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValue({ ok: true });
        const email = 'iforgotpassword@example.com';
        controller.execute({ email });
        expect(usecaseSpy).toHaveBeenCalledWith(email);
    });

    it('ユースケースが正常に完了した場合、okがtrueのレスポンスが返る', () => {
        const {
            forgotPassword: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValue({ ok: true });
        const email = 'iforgotpassword@example.com';
        const response = controller.execute({ email });
        expect(response).toEqual(new AppsScriptServerResponse({ ok: true }));
    });

    it('ユースケースが失敗した場合、エラーが返る', () => {
        const {
            forgotPassword: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to send reset email');
        });
        const email = 'iforgotpassword@example.com';
        expect(() => controller.execute({ email })).toThrow(
            'Failed to send reset email'
        );
    });
});
