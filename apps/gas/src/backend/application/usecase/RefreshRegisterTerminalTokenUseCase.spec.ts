import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { context } from '../../../../tests/contexts/registerTerminalTestContext';
import { User } from '@mydx-pos/shared/domain/entity/User';
import { RegisterTerminalTable } from '../../infrastructure/database/tables';

const userId = '123e4567-e89b-42d3-a456-426614174000';
const terminalId = '123e4567-e89b-42d3-a456-426614174001';
const pepper = '123e4567-e89b-42d3-a456-426614174099';

function adminUser() {
    return new User(userId, '管理者', 'admin@example.com', 'password', true, 1);
}

function input() {
    return {
        registerTerminalId: terminalId,
        バージョン: 1,
    };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            refreshRegisterTerminalToken: { usecase },
        } = context();

        expect(() =>
            usecase.execute(undefined as unknown as string, input())
        ).toThrow(InvalidArgumentError);
    });

    it('対象のレジ端末が存在しない場合はエラー', () => {
        const {
            refreshRegisterTerminalToken: { usecase },
            permissionCheckSpy: { hasRoleSpy },
        } = context();
        hasRoleSpy.mockReturnValue({ hasRole: true, user: adminUser() });

        expect(() => usecase.execute(userId, input())).toThrow(
            InvalidArgumentError
        );
    });
});

describe('認可', () => {
    it('システム管理者権限がない場合はエラー', () => {
        const {
            refreshRegisterTerminalToken: { usecase },
            permissionCheckSpy: { hasRoleSpy },
        } = context();
        hasRoleSpy.mockReturnValue({ hasRole: false, user: null });

        expect(() => usecase.execute(userId, input())).toThrow(ForbiddenError);
    });
});

describe('レジ端末トークン再発行', () => {
    it('新しい平文トークンを返し、DBのハッシュを更新する', () => {
        const {
            refreshRegisterTerminalToken: { usecase },
            permissionCheckSpy: { hasRoleSpy },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        hasRoleSpy.mockReturnValue({ hasRole: true, user: adminUser() });
        vi.spyOn(Math, 'random').mockReturnValue(0);

        dataStore.set(':レジ端末', [
            Object.keys(RegisterTerminalTable.schema.def.shape),
            [
                terminalId,
                '受付レジ',
                'old-token-hash',
                true,
                '2026-01-01T00:00:00.000Z',
                null,
                userId,
                null,
                1,
            ],
        ]);

        const result = usecase.execute(userId, input());
        const expectedHash = passwordProtection.execute(
            'RGT-AAAA-AAAA-AAAA',
            terminalId
        );

        expect(result).toEqual({
            registerTerminal: {
                ID: terminalId,
                端末名: '受付レジ',
                有効: true,
                発行日時: expect.any(String),
                最終利用日時: null,
                バージョン: 2,
            },
            plainToken: 'RGT-AAAA-AAAA-AAAA',
        });
        expect(dataStore.get(':レジ端末').rows[0]).toEqual([
            terminalId,
            '受付レジ',
            expectedHash,
            true,
            result.registerTerminal.発行日時,
            null,
            userId,
            userId,
            2,
        ]);
    });
});
