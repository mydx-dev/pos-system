import {
    AppsScriptServerResponse,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/registerTerminalTestContext';
import { LoginRegisterTerminalRequest } from '../../shared/api/registerTerminal';

function correctInput(): LoginRegisterTerminalRequest {
    return {
        token: 'RGT-AAAA-AAAA-AAAA',
    };
}

describe('バリデーション', () => {
    it('入力が不正な場合はエラー', () => {
        const {
            loginRegisterTerminal: { controller },
        } = context();
        const input = correctInput();
        input.token = undefined as unknown as string;

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('レジ端末ログイン', () => {
    it('ユースケースを実行する', () => {
        const {
            loginRegisterTerminal: { controller, usecaseSpy },
        } = context();
        const input = correctInput();
        usecaseSpy.mockReturnValue({
            registerTerminal: {
                ID: '123e4567-e89b-42d3-a456-426614174001',
                端末名: '受付レジ',
                有効: true,
                最終利用日時: '2026-01-01T00:00:00.000Z',
            },
        });

        controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith(input);
    });

    it('成功時にログイン結果を返す', () => {
        const {
            loginRegisterTerminal: { controller, usecaseSpy },
        } = context();
        const output = {
            registerTerminal: {
                ID: '123e4567-e89b-42d3-a456-426614174001',
                端末名: '受付レジ',
                有効: true,
                最終利用日時: '2026-01-01T00:00:00.000Z',
            },
        };
        usecaseSpy.mockReturnValue(output);

        expect(controller.execute(correctInput())).toEqual(
            new AppsScriptServerResponse(output)
        );
    });
});
