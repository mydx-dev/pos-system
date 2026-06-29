import {
    AppsScriptServerResponse,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/approveUserTestContext';

describe('ユーザー承認', () => {
    it('入力が不正な場合、エラーになる', () => {
        const {
            approveUser: { controller },
        } = context();
        expect(() => {
            controller.execute({
                sessionToken: undefined as unknown as string,
                user: undefined as unknown as any,
            });
        }).toThrow(ZodError);
    });

    it('認証に失敗した場合、エラーになる', () => {
        const sessionToken = 'invalid-session-token';
        const user = {
            ID: '123e4567-e89b-42d3-a456-426614174000',
            氏名: 'Test User',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: false,
            バージョン: 1,
        };
        const {
            approveUser: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new UnauthorizedError('Authentication failed');
        });

        expect(() => controller.execute({ sessionToken, user })).toThrow(
            UnauthorizedError
        );
    });

    it('ユーザー承認処理を呼び出す', () => {
        const sessionToken = 'valid-session-token';
        const user = {
            ID: '123e4567-e89b-42d3-a456-426614174000',
            バージョン: 1,
        };
        const {
            approveUser: { controller, usecaseSpy },
            authSpy,
        } = context();

        authSpy.mockReturnValueOnce('executor-user-id');
        usecaseSpy.mockReturnValueOnce({
            user: {
                ID: '123e4567-e89b-42d3-a456-426614174000',
                氏名: 'Test User',
                メールアドレス: 'test@example.com',
                パスワード: '',
                承認: true,
                バージョン: 2,
            },
        });
        controller.execute({ sessionToken, user });
        expect(usecaseSpy).toHaveBeenCalledWith('executor-user-id', user);
    });

    it('ユーザー承認処理が成功した場合、ユーザー情報を返す', () => {
        const sessionToken = 'valid-session-token';
        const userParams = {
            ID: '123e4567-e89b-42d3-a456-426614174000',
            氏名: 'Test User',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: false,
            バージョン: 1,
        };

        const {
            approveUser: { controller, usecaseSpy },
            authSpy,
        } = context();

        authSpy.mockReturnValueOnce('executor-user-id');
        usecaseSpy.mockReturnValueOnce({
            user: {
                ID: '123e4567-e89b-42d3-a456-426614174000',
                氏名: 'Test User',
                メールアドレス: 'test@example.com',
                パスワード: '',
                承認: true,
                バージョン: 2,
            },
        });

        const response = controller.execute({ sessionToken, user: userParams });
        expect(response).toEqual(
            new AppsScriptServerResponse({
                user: {
                    ID: '123e4567-e89b-42d3-a456-426614174000',
                    氏名: 'Test User',
                    メールアドレス: 'test@example.com',
                    パスワード: '',
                    承認: true,
                    バージョン: 2,
                },
            })
        );
    });

    it('ユーザー承認処理に失敗した場合、適切なエラーになる', () => {
        const sessionToken = 'valid-session-token';
        const user = {
            ID: '123e4567-e89b-42d3-a456-426614174000',
            氏名: 'Test User',
            メールアドレス: 'test@example.com',
            パスワード: 'password',
            承認: false,
            バージョン: 1,
        };

        const {
            approveUser: { controller, usecaseSpy },
            authSpy,
        } = context();

        authSpy.mockReturnValueOnce('executor-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('Approval failed');
        });

        expect(() => controller.execute({ sessionToken, user })).toThrow(
            'Approval failed'
        );
    });
});
