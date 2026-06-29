import { describe, expect, it, vi } from 'vitest';
import { context } from '../../../tests/contexts/setupSystemTestContext';

describe('ユースケースの呼び出し', () => {
    it('システムセットアップユースケースが正常に呼び出される', () => {
        const {
            setupSystem: { usecaseSpy, controller },
            scope,
        } = context();
        usecaseSpy.mockReturnValueOnce('');
        const forgotPasswordSpy = vi.spyOn(
            scope.resolve('forgotPasswordUseCase'),
            'execute'
        );
        forgotPasswordSpy.mockReturnValueOnce({ ok: true });
        controller.execute();
        expect(usecaseSpy).toHaveBeenCalledWith();
    });
    it('システムセットアップユースケースの呼び出しに失敗した場合、エラーを返す', () => {
        const {
            setupSystem: { usecaseSpy, controller },
        } = context();
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to initialize system');
        });
        expect(() => controller.execute()).toThrow(
            'Failed to initialize system'
        );
    });
    it('システムセットアップユースケースが正常に完了した場合、スクリプトオーナーのメールアドレスを返し、パスワード忘れユースケースに渡す', () => {
        const {
            setupSystem: { usecaseSpy, controller },
            scope,
        } = context();
        const loggerLogSpy = vi.spyOn(scope.resolve('logger'), 'log');
        const ownerEmail = 'owner@example.com';
        usecaseSpy.mockReturnValueOnce(ownerEmail);
        const forgotPasswordSpy = vi.spyOn(
            scope.resolve('forgotPasswordUseCase'),
            'execute'
        );
        forgotPasswordSpy.mockReturnValueOnce({ ok: true });
        controller.execute();
        expect(forgotPasswordSpy).toHaveBeenCalledWith(ownerEmail);
        expect(loggerLogSpy).toHaveBeenCalledWith(
            `========================================
システムの初期設定が完了しました。

初期管理者:
${ownerEmail}

上記メールアドレス宛に
パスワード設定メールを送信しました。

メール内のURLから
初回パスワードを設定してください。
========================================`
        );
    });
});
