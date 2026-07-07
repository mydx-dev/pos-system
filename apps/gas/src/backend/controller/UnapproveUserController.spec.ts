import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/unapproveUserTestContext';

const uuid = '780c4cdb-52cf-4b2f-9d35-c20166ed9df2';
function correctInput() {
    return {
        sessionToken: 'test-session-token',
        user: {
            ID: uuid,
            バージョン: 1,
        },
    };
}

function correctOutput() {
    return {
        user: {
            ID: 'test-user-id',
            氏名: 'テストユーザー',
            メールアドレス: 'test@example.com',
            パスワード: 'hashed-password',
            承認: false,
            バージョン: 1,
        },
    };
}

describe('バリデーション', () => {
    it('入力値が不正な場合、HTTP400エラー', () => {
        const {
            unapproveUser: { controller },
        } = context();
        expect(() => controller.execute({} as any)).toThrow(
            InvalidArgumentError
        );
    });
});

describe('ミドルウェア', () => {
    it('認証に失敗した場合、HTTP401エラー', () => {
        const {
            unapproveUser: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('認証に失敗しました');
        });

        const input = correctInput();

        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
        authSpy.mockRestore();
    });
});

describe('ユースケースの呼び出し', () => {
    it('認証で受け取ったユーザーIDをユースケースに渡す', () => {
        const {
            unapproveUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        const userId = 'test-user-id';
        authSpy.mockReturnValue(userId);
        usecaseSpy.mockReturnValue({
            ID: uuid,
            氏名: 'テストユーザー',
            メールアドレス: 'test@example.com',
            パスワード: 'hashed-password',
            承認: false,
            バージョン: 1,
        });
        const input = correctInput();
        controller.execute(input);
        expect(usecaseSpy).toHaveBeenCalledWith(userId, input.user);
    });

    it('ユースケースが失敗した場合、エラーをスローする', () => {
        const {
            unapproveUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue('test-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('ユースケースの実行に失敗しました');
        });
        const input = correctInput();
        expect(() => controller.execute(input)).toThrow(
            'ユースケースの実行に失敗しました'
        );
    });

    it('ユースケースが正常に完了した場合、承認されたユーザーをGASのサーバーレスポンス形式で返す', () => {
        const {
            unapproveUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue('test-user-id');
        const expectedOutput = correctOutput();
        usecaseSpy.mockReturnValue(expectedOutput.user);
        const input = correctInput();
        const output = controller.execute(input);
        expect(output).toEqual(new AppsScriptServerResponse(expectedOutput));
    });
});
