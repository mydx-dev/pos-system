import {
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/updateUserTestContext';

describe('バリデーション', () => {
    it('セッショントークンがない場合は401エラーになる', () => {
        const {
            updateUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                sessionToken: undefined as unknown as string,
                user: {
                    ID: '123e4567-e89b-42d3-a456-426614174000',
                    氏名: 'Test User',
                    メールアドレス: 'test@example.com',
                    バージョン: 1,
                },
            })
        ).toThrow(InvalidArgumentError);
    });
    it('ユーザー情報が不正な場合は401エラーを返す', () => {
        const {
            updateUser: { controller },
        } = context();
        expect(() =>
            controller.execute({
                sessionToken: 'valid-session-token',
                user: {
                    ID: 'invalid-id',
                    氏名: '',
                    メールアドレス: 'invalid-email',
                    バージョン: 1,
                },
            })
        ).toThrow(InvalidArgumentError);
    });
});

describe('正常系', () => {
    const {
        updateUser: { usecaseSpy, controller },
        authSpy,
    } = context();
    it('ユースケースが正常に呼び出される', () => {
        authSpy.mockReturnValue('executor-user-id');
        usecaseSpy.mockReturnValue({
            ID: '123e4567-e89b-42d3-a456-426614174000',
            氏名: 'Updated User',
            メールアドレス: 'updated@example.com',
            パスワード: '',
            承認: true,
            バージョン: 2,
        });

        controller.execute({
            sessionToken: 'valid-session-token',
            user: {
                ID: '123e4567-e89b-42d3-a456-426614174000',
                氏名: 'Updated User',
                メールアドレス: 'updated@example.com',
                バージョン: 2,
            },
        });

        expect(usecaseSpy).toHaveBeenCalledWith('executor-user-id', {
            ID: '123e4567-e89b-42d3-a456-426614174000',
            氏名: 'Updated User',
            メールアドレス: 'updated@example.com',
            バージョン: 2,
        });
    });
});

describe('認証', () => {
    it('認証に失敗した場合はUnauthorizedErrorになる', () => {
        const {
            updateUser: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new UnauthorizedError('Authentication failed');
        });
        expect(() =>
            controller.execute({
                sessionToken: 'invalid-session-token',
                user: {
                    ID: '123e4567-e89b-42d3-a456-426614174000',
                    氏名: 'Updated User',
                    メールアドレス: 'updated@example.com',
                    バージョン: 2,
                },
            })
        ).toThrow(UnauthorizedError);
    });
});

describe('エラーハンドリング', () => {
    const {
        updateUser: { usecaseSpy, controller },
        authSpy,
    } = context();

    it('ユースケースがエラーを返す場合は適切にハンドリングされる', () => {
        authSpy.mockReturnValue('executor-user-id');
        usecaseSpy.mockImplementation(() => {
            throw new Error('Some error');
        });
        expect(() =>
            controller.execute({
                sessionToken: 'valid-session-token',
                user: {
                    ID: '123e4567-e89b-42d3-a456-426614174000',
                    氏名: 'Updated User',
                    メールアドレス: 'updated@example.com',
                    バージョン: 2,
                },
            })
        ).toThrow('Some error');
    });
});
