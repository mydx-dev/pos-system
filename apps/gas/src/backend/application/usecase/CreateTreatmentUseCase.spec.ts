import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/createTreatmentTestContext';
import { CreateTreatmentRequest } from '@mydx-pos/shared/api/treatment';
import {
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
    RoleTable,
    UserTable,
} from '../../infrastructure/database/tables';

const customerId = '11111111-1111-4111-8111-111111111111';
const staffId = '22222222-2222-4222-8222-222222222222';
const categoryId = '33333333-3333-4333-8333-333333333333';
const cutMenuId = '44444444-4444-4444-8444-444444444444';
const colorMenuId = '55555555-5555-4555-8555-555555555555';

function correctInput(): Pick<
    CreateTreatmentRequest,
    'treatment' | 'treatmentMenus'
> {
    return {
        treatment: {
            顧客ID: customerId,
            担当スタッフID: staffId,
            開始日時: '2026-07-02T10:00:00.000Z',
            所要時間: 165,
            備考: '初回来店',
        },
        treatmentMenus: [
            {
                メニューID: cutMenuId,
                数量: 1,
                値引き額: 500,
                表示順: 1,
            },
            {
                メニューID: colorMenuId,
                数量: 2,
                値引き額: 0,
                表示順: 2,
            },
        ],
    };
}

function seedData(dataStore: ReturnType<typeof context>['dataStore']) {
    dataStore.set(`${UserTable.dbId}:${UserTable.name}`, [
        Object.keys(UserTable.schema.def.shape),
        [staffId, 'スタッフ', 'staff@example.com', 'password', true, 1],
    ]);
    dataStore.set(`${RoleTable.dbId}:${RoleTable.name}`, [
        Object.keys(RoleTable.schema.def.shape),
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
    ]);
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            createTreatment: { usecase },
        } = context();
        expect(() =>
            usecase.execute(undefined as unknown as string, correctInput())
        ).toThrow(InvalidArgumentError);
    });

    it('15分単位ではない開始時刻の場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatment.開始日時 = '2026-07-02T10:10:00.000Z';

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('存在しない顧客IDの場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatment.顧客ID = '66666666-6666-4666-8666-666666666666';

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('存在しないスタッフIDの場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatment.担当スタッフID = '66666666-6666-4666-8666-666666666666';

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('存在しないメニューIDの場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatmentMenus[0].メニューID =
            '66666666-6666-4666-8666-666666666666';

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('値引き額が通常価格を超える場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatmentMenus[0].値引き額 = 5001;

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('所要時間が0分未満の場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatment.所要時間 = -15;

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });

    it('所要時間が15分単位ではない場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatment.所要時間 = 50;

        expect(() => usecase.execute(staffId, input)).toThrow(
            InvalidArgumentError
        );
    });
});

describe('認可', () => {
    it('承認済みシステム管理者またはスタッフでない場合はエラー', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
        } = context();
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(false);

        expect(() => usecase.execute(staffId, correctInput())).toThrow(
            ForbiddenError
        );
    });
});

describe('施術登録', () => {
    it('施術と施術メニューを登録できる', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
            getUuidSpy,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);

        const result = usecase.execute(staffId, correctInput());
        const treatmentId = getUuidSpy.mock.results[0].value;
        const firstTreatmentMenuId = getUuidSpy.mock.results[1].value;
        const secondTreatmentMenuId = getUuidSpy.mock.results[2].value;

        expect(result).toEqual({
            treatment: {
                ID: treatmentId,
                顧客ID: customerId,
                担当スタッフID: staffId,
                状態: '予約済み',
                開始日時: '2026-07-02T10:00:00.000Z',
                所要時間: 165,
                終了日時: '2026-07-02T12:45:00.000Z',
                備考: '初回来店',
                バージョン: 1,
            },
            treatmentMenus: [
                {
                    ID: firstTreatmentMenuId,
                    施術ID: treatmentId,
                    メニューID: cutMenuId,
                    メニュー名: 'カット',
                    通常価格: 5000,
                    数量: 1,
                    値引き額: 500,
                    表示順: 1,
                    バージョン: 1,
                },
                {
                    ID: secondTreatmentMenuId,
                    施術ID: treatmentId,
                    メニューID: colorMenuId,
                    メニュー名: 'カラー',
                    通常価格: 8000,
                    数量: 2,
                    値引き額: 0,
                    表示順: 2,
                    バージョン: 1,
                },
            ],
        });
    });

    it('メニュー未選択でも登録できる', () => {
        const {
            createTreatment: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
        } = context();
        seedData(dataStore);
        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);
        const input = correctInput();
        input.treatmentMenus = [];
        input.treatment.状態 = '来店済み';

        const result = usecase.execute(staffId, input);

        expect(result.treatment.状態).toBe('来店済み');
        expect(result.treatment.所要時間).toBe(165);
        expect(result.treatmentMenus).toEqual([]);
    });
});
