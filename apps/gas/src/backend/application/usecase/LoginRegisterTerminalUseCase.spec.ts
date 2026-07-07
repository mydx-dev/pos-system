import { UnauthorizedError } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/registerTerminalTestContext';
import { RegisterTerminalTable } from '../../infrastructure/database/tables';

const userId = '123e4567-e89b-42d3-a456-426614174000';
const terminalId = '123e4567-e89b-42d3-a456-426614174001';
const pepper = '123e4567-e89b-42d3-a456-426614174099';

describe('レジ端末ログイン', () => {
    it('トークンが一致する有効なレジ端末がない場合はエラー', () => {
        const {
            loginRegisterTerminal: { usecase },
            properties,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);

        expect(() => usecase.execute({ token: 'RGT-NONE-NONE-NONE' })).toThrow(
            UnauthorizedError
        );
    });

    it('有効なトークンでログインし、最終利用日時を更新する', () => {
        const {
            loginRegisterTerminal: { usecase },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        const tokenHash = passwordProtection.execute(
            'RGT-AAAA-AAAA-AAAA',
            terminalId
        );
        dataStore.set(':レジ端末', [
            Object.keys(RegisterTerminalTable.schema.def.shape),
            [
                terminalId,
                '受付レジ',
                tokenHash,
                true,
                '2026-01-01T00:00:00.000Z',
                null,
                userId,
                null,
                1,
            ],
        ]);

        const result = usecase.execute({ token: ' rgt-aaaa-aaaa-aaaa ' });

        expect(result).toEqual({
            registerTerminal: {
                ID: terminalId,
                端末名: '受付レジ',
                有効: true,
                最終利用日時: expect.any(String),
            },
        });
        expect(dataStore.get(':レジ端末').rows[0][5]).toBe(
            result.registerTerminal.最終利用日時
        );
    });

    it('無効化されたレジ端末はログインできない', () => {
        const {
            loginRegisterTerminal: { usecase },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        const tokenHash = passwordProtection.execute(
            'RGT-AAAA-AAAA-AAAA',
            terminalId
        );
        dataStore.set(':レジ端末', [
            Object.keys(RegisterTerminalTable.schema.def.shape),
            [
                terminalId,
                '受付レジ',
                tokenHash,
                false,
                '2026-01-01T00:00:00.000Z',
                null,
                userId,
                null,
                1,
            ],
        ]);

        expect(() => usecase.execute({ token: 'RGT-AAAA-AAAA-AAAA' })).toThrow(
            UnauthorizedError
        );
    });
});
