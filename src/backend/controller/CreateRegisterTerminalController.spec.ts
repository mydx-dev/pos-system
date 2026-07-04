import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/registerTerminalTestContext';
import { CreateRegisterTerminalRequest } from '../../shared/api/registerTerminal';

function correctInput(): CreateRegisterTerminalRequest {
    return {
        sessionToken: 'valid-session-token',
        terminal: {
            端末名: '受付レジ',
        },
    };
}

describe('バリデーション', () => {
    it('入力が不正な場合はエラー', () => {
        const {
            createRegisterTerminal: { controller },
        } = context();
        const input = correctInput();
        input.sessionToken = undefined as unknown as string;

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合はエラー', () => {
        const {
            createRegisterTerminal: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });

        expect(() => controller.execute(correctInput())).toThrow(
            UnauthorizedError
        );
    });
});

describe('レジ端末登録', () => {
    it('ユースケースを実行する', () => {
        const {
            createRegisterTerminal: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = correctInput();
        authSpy.mockReturnValue('executor-user-id');
        usecaseSpy.mockReturnValue({
            registerTerminal: {
                ID: '123e4567-e89b-42d3-a456-426614174001',
                端末名: '受付レジ',
                有効: true,
                発行日時: '2026-01-01T00:00:00.000Z',
                最終利用日時: null,
                バージョン: 1,
            },
            plainToken: 'RGT-AAAA-AAAA-AAAA',
        });

        controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith('executor-user-id', input);
    });

    it('成功時に登録結果を返す', () => {
        const {
            createRegisterTerminal: { controller, usecaseSpy },
            authSpy,
        } = context();
        authSpy.mockReturnValue('executor-user-id');
        const output = {
            registerTerminal: {
                ID: '123e4567-e89b-42d3-a456-426614174001',
                端末名: '受付レジ',
                有効: true,
                発行日時: '2026-01-01T00:00:00.000Z',
                最終利用日時: null,
                バージョン: 1,
            },
            plainToken: 'RGT-AAAA-AAAA-AAAA',
        };
        usecaseSpy.mockReturnValue(output);

        expect(controller.execute(correctInput())).toEqual(
            new AppsScriptServerResponse(output)
        );
    });
});
