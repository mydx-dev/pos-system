import {
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/createCustomerTestContext';
import { CreateCustomerInput } from '@mydx-pos/shared/api/customer';

function correctInput(): CreateCustomerInput {
    return {
        sessionToken: 'valid-session-token',
        customer: {
            氏名: '山田 太郎',
            主担当スタッフID: null,
            担当固定: false,
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
    it('セッショントークンが空の場合はエラー', () => {
        const {
            createCustomer: { controller },
        } = context();
        const input = correctInput();
        input.sessionToken = undefined as unknown as string;

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });

    it('メールアドレス形式が不正な場合はエラー', () => {
        const {
            createCustomer: { controller },
        } = context();
        const input = correctInput();
        input.customer.メールアドレス = 'invalid-email';

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合はエラー', () => {
        const {
            createCustomer: { controller },
            authSpy,
        } = context();
        const input = correctInput();

        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });

        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('顧客作成', () => {
    it('顧客作成ユースケースを実行する', () => {
        const {
            createCustomer: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = correctInput();

        authSpy.mockReturnValue('valid-user-id');
        usecaseSpy.mockReturnValue({
            customer: {
                ID: '123e4567-e89b-42d3-a456-426614174000',
                氏名: input.customer.氏名,
                主担当スタッフID: null,
                担当固定: false,
                メールアドレス: input.customer.メールアドレス,
                電話番号: input.customer.電話番号,
                生年月日: input.customer.生年月日,
                郵便番号: input.customer.郵便番号,
                住所: input.customer.住所,
                備考: input.customer.備考,
                バージョン: 1,
            },
        });

        controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith(
            'valid-user-id',
            input.customer
        );
    });
});
