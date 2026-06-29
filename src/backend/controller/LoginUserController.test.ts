import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/loginUserTestContext';

describe('ユーザーがログインする', () => {
    it('メールアドレスがない場合はエラーになる', () => {
        const {
            loginUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                email: undefined as never,
                password: 'Password123!',
            })
        ).toThrow(ZodError);
    });

    it('パスワードがない場合はエラーになる', () => {
        const {
            loginUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                email: 'user@example.com',
                password: undefined as never,
            })
        ).toThrow(ZodError);
    });

    describe('正常系', () => {
        const {
            loginUser: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockReturnValue({
            user: {
                id: '1',
                name: 'Test User',
                email: 'user@example.com',
                role: ['システム管理者'],
            },
            sessionToken: 'valid-session-token',
        });
        const email = 'user@example.com';
        const password = 'Password123!';
        const result = controller.execute({
            email,
            password,
        });
        it('メールアドレスとパスワードが正しい場合はログイン処理を実行する', () => {
            expect(usecaseSpy).toHaveBeenCalledWith({
                email,
                password,
            });
        });
        it('ログインに成功すると、セッショントークンとユーザーIDが発行される', () => {
            expect(result).toEqual(
                new AppsScriptServerResponse({
                    sessionToken: 'valid-session-token',
                    userId: '1',
                })
            );
        });
    });

    it('ログイン処理に失敗した場合、適切なエラーになる', () => {
        const {
            loginUser: { controller, usecaseSpy },
        } = context();
        usecaseSpy.mockImplementation(() => {
            throw new Error('Invalid credentials');
        });

        expect(() =>
            controller.execute({
                email: 'user@example.com',
                password: 'wrong-password',
            })
        ).toThrow('Invalid credentials');
    });
});
