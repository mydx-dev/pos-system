import {
    ForbiddenError,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/createCustomerTestContext';
import { CreateCustomerInput } from '@mydx-pos/shared/api/customer';

const staffId = '223e4567-e89b-42d3-a456-426614174000';

function correctInput(): {
    userId: string;
    customer: CreateCustomerInput['customer'];
} {
    return {
        userId: '123e4567-e89b-42d3-a456-426614174000',
        customer: {
            氏名: '山田 太郎',
            主担当スタッフID: staffId,
            担当固定: true,
            メールアドレス: 'customer@example.com',
            電話番号: '09012345678',
            生年月日: '1990-01-01',
            郵便番号: '1000001',
            住所: '東京都千代田区',
            備考: '備考',
        },
    };
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            createCustomer: { usecase },
        } = context();
        const input = correctInput();
        input.userId = undefined as unknown as string;

        expect(() => usecase.execute(input.userId, input.customer)).toThrow(
            InvalidArgumentError
        );
    });

    it('主担当スタッフIDが存在しない場合はエラー', () => {
        const {
            createCustomer: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
        } = context();
        const input = correctInput();

        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);

        expect(() => usecase.execute(input.userId, input.customer)).toThrow(
            InvalidArgumentError
        );
    });
});

describe('認可', () => {
    it('承認済みシステム管理者またはスタッフでない場合はエラー', () => {
        const {
            createCustomer: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
        } = context();
        const input = correctInput();

        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(false);

        expect(() => usecase.execute(input.userId, input.customer)).toThrow(
            ForbiddenError
        );
    });
});

describe('顧客作成', () => {
    it('顧客を作成できる', () => {
        const {
            createCustomer: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dbSpy: { createSpy },
            db,
            dataStore,
            getUuidSpy,
        } = context();
        const input = correctInput();
        const [staffUser] = db.table('ユーザー').create([
            {
                氏名: 'Staff User',
                メールアドレス: 'staff@example.com',
                パスワード: '',
                承認: true,
                バージョン: 1,
                relations: {
                    スタッフ: [{}],
                },
            },
        ]);
        input.customer.主担当スタッフID = staffUser.id;
        createSpy.mockClear();

        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);

        const result = usecase.execute(input.userId, input.customer);
        const customerId = getUuidSpy.mock.results[1].value;

        expect(createSpy).toHaveBeenCalledWith([
            {
                氏名: input.customer.氏名,
                主担当スタッフID: input.customer.主担当スタッフID,
                担当固定: input.customer.担当固定,
                メールアドレス: input.customer.メールアドレス,
                電話番号: input.customer.電話番号,
                生年月日: input.customer.生年月日,
                郵便番号: input.customer.郵便番号,
                住所: input.customer.住所,
                備考: input.customer.備考,
                バージョン: 1,
            },
        ]);

        expect(dataStore.get(':顧客').rows).toEqual([
            [
                customerId,
                input.customer.氏名,
                input.customer.主担当スタッフID,
                true,
                input.customer.メールアドレス,
                input.customer.電話番号,
                input.customer.生年月日,
                input.customer.郵便番号,
                input.customer.住所,
                input.customer.備考,
                1,
            ],
        ]);

        expect(result).toEqual({
            customer: {
                ID: customerId,
                氏名: input.customer.氏名,
                主担当スタッフID: input.customer.主担当スタッフID,
                担当固定: true,
                メールアドレス: input.customer.メールアドレス,
                電話番号: input.customer.電話番号,
                生年月日: input.customer.生年月日,
                郵便番号: input.customer.郵便番号,
                住所: input.customer.住所,
                備考: input.customer.備考,
                バージョン: 1,
            },
        });
    });

    it('任意項目がすべてnullでも顧客を作成できる', () => {
        const {
            createCustomer: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
            dataStore,
            getUuidSpy,
        } = context();
        const input = correctInput();
        input.customer.主担当スタッフID = null;
        input.customer.メールアドレス = null;
        input.customer.電話番号 = null;
        input.customer.生年月日 = null;
        input.customer.郵便番号 = null;
        input.customer.住所 = null;
        input.customer.備考 = null;

        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);

        const result = usecase.execute(input.userId, input.customer);
        const customerId = getUuidSpy.mock.results[0].value;

        expect(dataStore.get(':顧客').rows).toEqual([
            [
                customerId,
                input.customer.氏名,
                null,
                true,
                null,
                null,
                null,
                null,
                null,
                null,
                1,
            ],
        ]);

        expect(result).toEqual({
            customer: {
                ID: customerId,
                氏名: input.customer.氏名,
                主担当スタッフID: null,
                担当固定: true,
                メールアドレス: null,
                電話番号: null,
                生年月日: null,
                郵便番号: null,
                住所: null,
                備考: null,
                バージョン: 1,
            },
        });
    });

    it('担当固定が未指定の場合はfalseで作成する', () => {
        const {
            createCustomer: { usecase },
            permissionCheckSpy: { isApprovedSystemAdminOrEmployeeSpy },
        } = context();
        const input = correctInput();
        input.customer.主担当スタッフID = undefined as unknown as string;
        input.customer.担当固定 = undefined as unknown as boolean;

        isApprovedSystemAdminOrEmployeeSpy.mockReturnValue(true);

        const result = usecase.execute(input.userId, input.customer);

        expect(result.customer.担当固定).toBe(false);
    });
});
