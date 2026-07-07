import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/saveTreatmentMenusTestContext';
import { SaveTreatmentMenusRequest } from '@mydx-pos/shared/api/treatment';
import {
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
    RoleTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from '../../infrastructure/database/tables';

const userId = '11111111-1111-4111-8111-111111111111';
const customerId = '22222222-2222-4222-8222-222222222222';
const staffId = '33333333-3333-4333-8333-333333333333';
const treatmentId = '44444444-4444-4444-8444-444444444444';
const otherTreatmentId = '55555555-5555-4555-8555-555555555555';
const categoryId = '66666666-6666-4666-8666-666666666666';
const cutMenuId = '77777777-7777-4777-8777-777777777777';
const colorMenuId = '88888888-8888-4888-8888-888888888888';
const permMenuId = '99999999-9999-4999-8999-999999999999';
const cutTreatmentMenuId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const colorTreatmentMenuId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const otherTreatmentMenuId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

function input(): SaveTreatmentMenusRequest {
    return {
        sessionToken: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        treatmentId,
        treatmentMenus: [
            {
                ID: cutTreatmentMenuId,
                メニューID: cutMenuId,
                数量: 1,
                値引き額: 500,
                表示順: 2,
                バージョン: 1,
            },
            {
                ID: '',
                メニューID: colorMenuId,
                数量: 2,
                値引き額: 0,
                表示順: 1,
            },
        ],
        deletedTreatmentMenuIds: [colorTreatmentMenuId],
    };
}

function seedData(dataStore: ReturnType<typeof context>['dataStore']) {
    dataStore.set(`${UserTable.dbId}:${UserTable.name}`, [
        Object.keys(UserTable.schema.def.shape),
        [userId, 'テストユーザー', 'user@example.com', 'password', true, 1],
        [staffId, 'スタッフ', 'staff@example.com', 'password', true, 1],
    ]);
    dataStore.set(`${RoleTable.dbId}:${RoleTable.name}`, [
        Object.keys(RoleTable.schema.def.shape),
        [userId, 'ユーザー'],
        [staffId, 'ユーザー'],
    ]);
    dataStore.set(`${EmployeeTable.dbId}:${EmployeeTable.name}`, [
        Object.keys(EmployeeTable.schema.def.shape),
        [staffId],
    ]);
    dataStore.set(`${CustomerTable.dbId}:${CustomerTable.name}`, [
        Object.keys(CustomerTable.schema.def.shape),
        [
            customerId,
            '顧客',
            staffId,
            false,
            null,
            null,
            null,
            null,
            null,
            null,
            1,
        ],
    ]);
    dataStore.set(`${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`, [
        Object.keys(MenuCategoryTable.schema.def.shape),
        [categoryId, '技術', '技術', 1],
    ]);
    dataStore.set(`${MenuTable.dbId}:${MenuTable.name}`, [
        Object.keys(MenuTable.schema.def.shape),
        [
            cutMenuId,
            'カット',
            'T-001',
            5000,
            1000,
            '内税',
            '業務用',
            '技術',
            categoryId,
            1,
        ],
        [
            colorMenuId,
            'カラー',
            'T-002',
            8000,
            2000,
            '内税',
            '業務用',
            '技術',
            categoryId,
            1,
        ],
        [
            permMenuId,
            'パーマ',
            'T-003',
            12000,
            2500,
            '内税',
            '業務用',
            '技術',
            categoryId,
            1,
        ],
    ]);
    dataStore.set(`${TreatmentTable.dbId}:${TreatmentTable.name}`, [
        Object.keys(TreatmentTable.schema.def.shape),
        [
            treatmentId,
            customerId,
            staffId,
            '来店済み',
            '2026-07-02T10:00:00.000Z',
            90,
            null,
            1,
        ],
        [
            otherTreatmentId,
            customerId,
            staffId,
            '来店済み',
            '2026-07-02T13:00:00.000Z',
            60,
            null,
            1,
        ],
    ]);
    dataStore.set(`${TreatmentMenuTable.dbId}:${TreatmentMenuTable.name}`, [
        Object.keys(TreatmentMenuTable.schema.def.shape),
        [
            cutTreatmentMenuId,
            treatmentId,
            cutMenuId,
            '旧カット',
            4500,
            1,
            0,
            1,
            1,
        ],
        [
            colorTreatmentMenuId,
            treatmentId,
            colorMenuId,
            '旧カラー',
            7000,
            1,
            0,
            2,
            1,
        ],
        [
            otherTreatmentMenuId,
            otherTreatmentId,
            permMenuId,
            'パーマ',
            12000,
            1,
            0,
            1,
            1,
        ],
    ]);
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
        } = context();
        expect(() =>
            usecase.execute(undefined as unknown as string, input())
        ).toThrow(InvalidArgumentError);
    });

    it('存在しない施術IDの場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );
        const request = input();
        request.treatmentId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

        expect(() => usecase.execute(userId, request)).toThrow(
            InvalidArgumentError
        );
    });

    it('存在しないメニューIDの場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );
        const request = input();
        request.treatmentMenus[0].メニューID =
            'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

        expect(() => usecase.execute(userId, request)).toThrow(
            InvalidArgumentError
        );
    });

    it('値引き額が通常価格を超える場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );
        const request = input();
        request.treatmentMenus[0].値引き額 = 5001;

        expect(() => usecase.execute(userId, request)).toThrow(
            InvalidArgumentError
        );
    });

    it('別施術の施術メニューIDを更新しようとした場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );
        const request = input();
        request.treatmentMenus[0].ID = otherTreatmentMenuId;

        expect(() => usecase.execute(userId, request)).toThrow(
            InvalidArgumentError
        );
    });
});

describe('認可', () => {
    it('承認済みシステム管理者・スタッフ・レジ端末でない場合はエラー', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
        } = context();
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            false
        );

        expect(() => usecase.execute(userId, input())).toThrow(ForbiddenError);
    });

    it('承認済みシステム管理者・スタッフ・レジ端末の場合は保存できる', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );

        expect(() => usecase.execute(userId, input())).not.toThrow();
    });
});

describe('施術メニュー保存', () => {
    it('既存を更新し、新規を作成し、削除対象を削除できる', () => {
        const {
            saveTreatmentMenus: { usecase },
            permissionCheckSpy: {
                isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy,
            },
            dbSpy: { upsertSpy, deleteSpy },
            dataStore,
            getUuidSpy,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeOrRegisterTerminalSpy.mockReturnValue(
            true
        );

        const result = usecase.execute(userId, input());
        const newTreatmentMenuId = getUuidSpy.mock.results[0].value;

        expect(upsertSpy).toHaveBeenCalledWith(
            [
                {
                    ID: cutTreatmentMenuId,
                    施術ID: treatmentId,
                    メニューID: cutMenuId,
                    メニュー名: 'カット',
                    通常価格: 5000,
                    数量: 1,
                    値引き額: 500,
                    表示順: 2,
                    バージョン: 1,
                },
                {
                    ID: '',
                    施術ID: treatmentId,
                    メニューID: colorMenuId,
                    メニュー名: 'カラー',
                    通常価格: 8000,
                    数量: 2,
                    値引き額: 0,
                    表示順: 1,
                    バージョン: 1,
                },
            ].map(TreatmentMenuTable.deserialize)
        );
        expect(deleteSpy).toHaveBeenCalledWith([colorTreatmentMenuId]);
        expect(result).toEqual({
            treatmentMenus: [
                {
                    ID: newTreatmentMenuId,
                    施術ID: treatmentId,
                    メニューID: colorMenuId,
                    メニュー名: 'カラー',
                    通常価格: 8000,
                    数量: 2,
                    値引き額: 0,
                    表示順: 1,
                    バージョン: 1,
                },
                {
                    ID: cutTreatmentMenuId,
                    施術ID: treatmentId,
                    メニューID: cutMenuId,
                    メニュー名: 'カット',
                    通常価格: 5000,
                    数量: 1,
                    値引き額: 500,
                    表示順: 2,
                    バージョン: 2,
                },
            ],
            deletedTreatmentMenuIds: [colorTreatmentMenuId],
        });
    });
});
