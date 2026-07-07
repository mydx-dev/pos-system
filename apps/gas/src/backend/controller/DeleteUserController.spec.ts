import {
    AppsScriptServerResponse,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, test } from 'vitest';
import { ZodError } from 'zod';
import { context } from '../../../tests/contexts/deleteUserTestContext';

describe('バリデーション', () => {
    test('削除するユーザーのIDがない場合はエラーになる', () => {
        const {
            deleteUser: { controller },
        } = context();
        const input = {} as unknown as any;
        expect(() => controller.execute(input)).toThrow(ZodError);
    });
    test('セッショントークンがない場合はエラーになる', () => {
        const {
            deleteUser: { controller },
        } = context();
        const input = {
            id: '123e4567-e89b-42d3-a456-426614174000',
        } as unknown as any;
        expect(() => controller.execute(input)).toThrow(ZodError);
    });
});

describe('認証', () => {
    test('認証に失敗した場合はエラーになる', () => {
        const {
            deleteUser: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Authentication failed');
        });
        const deleteUserId = '123e4567-e89b-42d3-a456-426614174000';
        const input = {
            id: deleteUserId,
            sessionToken: 'invalid-token',
        };
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('ユースケース', () => {
    test('正しい入力の場合はユーザーの削除処理が呼び出される', () => {
        const input = {
            id: '123e4567-e89b-42d3-a456-426614174000',
            sessionToken: 'valid-session-token-for-admin-user',
        };

        const adminUserId = 'admin-user-id';
        const {
            deleteUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue(adminUserId);
        usecaseSpy.mockReturnValue(true);

        controller.execute(input);
        expect(usecaseSpy).toHaveBeenCalledWith(adminUserId, input.id);
    });

    test('ユースケースが失敗した場合はエラーになる', () => {
        const input = {
            id: '123e4567-e89b-42d3-a456-426614174000',
            sessionToken: 'valid-session-token-for-admin-user',
        };

        const adminUserId = 'admin-user-id';
        const {
            deleteUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue(adminUserId);
        usecaseSpy.mockImplementation(() => {
            throw new Error('Delete failed');
        });

        expect(() => controller.execute(input)).toThrow('Delete failed');
    });

    test('ユースケースの結果を正しく返す', () => {
        const input = {
            id: '123e4567-e89b-42d3-a456-426614174000',
            sessionToken: 'valid-session-token-for-admin-user',
        };

        const adminUserId = 'admin-user-id';
        const {
            deleteUser: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue(adminUserId);
        usecaseSpy.mockReturnValue(true);

        const result = controller.execute(input);
        expect(result).toEqual(new AppsScriptServerResponse({ ok: true }));
    });
});
