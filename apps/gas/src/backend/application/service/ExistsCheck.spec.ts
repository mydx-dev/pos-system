import { describe, expect, it } from 'vitest';
import { createTestContext } from '../../../../tests/helpers/createTestContext';
import {
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
} from '../../infrastructure/database/tables';
import { ExistsCheck } from './ExistsCheck';

const customerId = '11111111-1111-4111-8111-111111111111';
const staffId = '22222222-2222-4222-8222-222222222222';
const categoryId = '33333333-3333-4333-8333-333333333333';
const menuId = '44444444-4444-4444-8444-444444444444';

function context() {
    const ctx = createTestContext();
    return {
        ...ctx,
        existsCheck: ctx.scope.resolve('existsCheck') as ExistsCheck,
    };
}

describe('存在確認', () => {
    it('顧客が存在する場合はtrueを返す', () => {
        const { dataStore, existsCheck } = context();
        dataStore.set(`${CustomerTable.dbId}:${CustomerTable.name}`, [
            Object.keys(CustomerTable.schema.def.shape),
            [
                customerId,
                '顧客',
                null,
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

        expect(existsCheck.hasCustomer(customerId)).toBe(true);
    });

    it('スタッフが存在する場合はtrueを返す', () => {
        const { dataStore, existsCheck } = context();
        dataStore.set(`${EmployeeTable.dbId}:${EmployeeTable.name}`, [
            Object.keys(EmployeeTable.schema.def.shape),
            [staffId],
        ]);

        expect(existsCheck.hasStaff(staffId)).toBe(true);
    });

    it('メニューキャッシュがない場合はDBを参照する', () => {
        const { dataStore, existsCheck } = context();
        dataStore.set(`${MenuCategoryTable.dbId}:${MenuCategoryTable.name}`, [
            Object.keys(MenuCategoryTable.schema.def.shape),
            [categoryId, '技術', '技術', 1],
        ]);
        dataStore.set(`${MenuTable.dbId}:${MenuTable.name}`, [
            Object.keys(MenuTable.schema.def.shape),
            [
                menuId,
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
        ]);

        expect(existsCheck.hasMenu(menuId)).toBe(true);
    });

    it('メニューキャッシュがある場合はキャッシュを参照する', () => {
        const { existsCheck } = context();
        existsCheck.cacheMenuIds([menuId]);

        expect(existsCheck.hasMenu(menuId)).toBe(true);
        expect(
            existsCheck.hasMenu('55555555-5555-4555-8555-555555555555')
        ).toBe(false);
    });
});
