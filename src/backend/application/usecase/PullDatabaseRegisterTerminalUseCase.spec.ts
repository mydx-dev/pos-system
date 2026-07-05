import { UnauthorizedError } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/registerTerminalTestContext';
import {
    CustomerTable,
    MenuCategoryTable,
    MenuTable,
    PaymentRecordTable,
    RegisterTerminalTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from '../../infrastructure/database/tables';

const userId = '123e4567-e89b-42d3-a456-426614174000';
const staffId = '123e4567-e89b-42d3-a456-426614174002';
const terminalId = '123e4567-e89b-42d3-a456-426614174001';
const customerId = '123e4567-e89b-42d3-a456-426614174003';
const categoryId = '123e4567-e89b-42d3-a456-426614174004';
const menuId = '123e4567-e89b-42d3-a456-426614174005';
const treatmentId = '123e4567-e89b-42d3-a456-426614174006';
const treatmentMenuId = '123e4567-e89b-42d3-a456-426614174007';
const paymentRecordId = '123e4567-e89b-42d3-a456-426614174008';
const pepper = '123e4567-e89b-42d3-a456-426614174099';
const token = 'RGT-AAAA-AAAA-AAAA';

function seedRegisterTerminal({
    enabled,
    tokenHash,
}: {
    enabled: boolean;
    tokenHash: string;
}) {
    return [
        Object.keys(RegisterTerminalTable.schema.def.shape),
        [
            terminalId,
            '受付レジ',
            tokenHash,
            enabled,
            '2026-01-01T00:00:00.000Z',
            null,
            userId,
            null,
            1,
        ],
    ];
}

function seedSyncData(dataStore: ReturnType<typeof context>['dataStore']) {
    dataStore.set(':ユーザー', [
        Object.keys(UserTable.schema.def.shape),
        [userId, '管理者', 'admin@example.com', 'password-hash', true, 1],
        [staffId, 'スタッフ', 'staff@example.com', 'staff-password', true, 1],
    ]);
    dataStore.set(':スタッフ', [['ユーザーID'], [staffId]]);
    dataStore.set(':顧客', [
        Object.keys(CustomerTable.schema.def.shape),
        [
            customerId,
            '顧客A',
            staffId,
            false,
            'customer@example.com',
            '09000000000',
            null,
            null,
            null,
            null,
            1,
        ],
    ]);
    dataStore.set(':メニューカテゴリー', [
        Object.keys(MenuCategoryTable.schema.def.shape),
        [categoryId, 'カット', '技術', 1],
    ]);
    dataStore.set(':メニュー', [
        Object.keys(MenuTable.schema.def.shape),
        [
            menuId,
            'カット',
            'M001',
            5500,
            0,
            '内税',
            '店販用',
            '技術',
            categoryId,
            1,
        ],
    ]);
    dataStore.set(':施術', [
        Object.keys(TreatmentTable.schema.def.shape),
        [
            treatmentId,
            customerId,
            staffId,
            '来店済み',
            '2026-07-05T10:00:00.000Z',
            60,
            null,
            1,
        ],
    ]);
    dataStore.set(':施術メニュー', [
        Object.keys(TreatmentMenuTable.schema.def.shape),
        [treatmentMenuId, treatmentId, menuId, 'カット', 5500, 1, 0, 1, 1],
    ]);
    dataStore.set(':精算履歴', [
        Object.keys(PaymentRecordTable.schema.def.shape),
        [
            paymentRecordId,
            treatmentId,
            '精算',
            5500,
            '現金',
            '2026-07-05T11:00:00.000Z',
            null,
            null,
            1,
        ],
    ]);
}

describe('レジ端末DB同期', () => {
    it('有効なレジ端末トークンでレジ用データだけ同期できる', () => {
        const {
            pullDatabaseRegisterTerminal: { controller },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        seedSyncData(dataStore);
        dataStore.set(
            ':レジ端末',
            seedRegisterTerminal({
                enabled: true,
                tokenHash: passwordProtection.execute(token, terminalId),
            })
        );

        const response = controller.execute({ registerTerminalToken: token });
        const data = JSON.parse(response.contents);

        expect(
            data.map(({ table }: { table: { name: string } }) => table.name)
        ).toEqual([
            '顧客',
            'スタッフ',
            'ユーザー',
            '施術',
            '施術メニュー',
            'メニュー',
            'メニューカテゴリー',
            '精算履歴',
        ]);
        expect(data).not.toContainEqual(
            expect.objectContaining({
                table: { name: 'レジ端末', primaryKey: 'ID' },
            })
        );
        expect(data).not.toContainEqual(
            expect.objectContaining({
                table: { name: 'ロール', primaryKey: 'ユーザーID' },
            })
        );
        const users = data.find(
            ({ table }: { table: { name: string } }) =>
                table.name === 'ユーザー'
        )?.records;
        expect(users).toEqual([
            expect.objectContaining({ ID: userId, パスワード: '' }),
            expect.objectContaining({ ID: staffId, パスワード: '' }),
        ]);
        expect(JSON.stringify(data)).not.toContain('トークンハッシュ');
        expect(dataStore.get(':レジ端末').rows[0][5]).toEqual(
            expect.any(String)
        );
    });

    it('無効化されたレジ端末では同期できない', () => {
        const {
            pullDatabaseRegisterTerminal: { controller },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        dataStore.set(
            ':レジ端末',
            seedRegisterTerminal({
                enabled: false,
                tokenHash: passwordProtection.execute(token, terminalId),
            })
        );

        expect(() =>
            controller.execute({ registerTerminalToken: token })
        ).toThrow(UnauthorizedError);
    });

    it('再発行前の古いトークンでは同期できない', () => {
        const {
            pullDatabaseRegisterTerminal: { controller },
            properties,
            passwordProtection,
            dataStore,
        } = context();
        properties.setProperty('PASSWORD_PEPPER', pepper);
        dataStore.set(
            ':レジ端末',
            seedRegisterTerminal({
                enabled: true,
                tokenHash: passwordProtection.execute(
                    'RGT-BBBB-BBBB-BBBB',
                    terminalId
                ),
            })
        );

        expect(() =>
            controller.execute({ registerTerminalToken: token })
        ).toThrow(UnauthorizedError);
    });
});
