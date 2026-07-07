import { ForbiddenError } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../../tests/contexts/createEmployeeTestContext';
import { User } from '@mydx-pos/shared/domain/entity/User';

function correctInput() {
    return {
        userId: '00000000-0000-4000-a000-000000000000',
        employee: {
            氏名: 'John Doe',
            メールアドレス: 'john.doe@example.com',
        },
    };
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            createEmployee: { usecase },
        } = context();
        const input = correctInput();
        input.userId = undefined as unknown as string;
        expect(() => usecase.execute(input.userId, input.employee)).toThrow();
    });
});

describe('認可', () => {
    it('承認済み且つ、システム管理者権限を持っていない場合はエラーになる', () => {
        const {
            createEmployee: { usecase },
            permissionCheckSpy: { hasRoleSpy },
        } = context();
        hasRoleSpy.mockReturnValue({ hasRole: false, user: null });
        const input = correctInput();
        expect(() => usecase.execute(input.userId, input.employee)).toThrow(
            ForbiddenError
        );
    });
});

describe('従業員作成', () => {
    it('新規作成したユーザーIDで従業員作成ユースケースを実行する', () => {
        const {
            createEmployee: { usecase },
            permissionCheckSpy: { hasRoleSpy },
            dbSpy: { createSpy },
            dataStore,
            getUuidSpy,
        } = context();
        const input = correctInput();

        hasRoleSpy.mockReturnValue({
            hasRole: true,
            user: new User(
                '00000000-0000-4000-a000-000000000000',
                'system-admin',
                'admin@example.com',
                'hashedPassword',
                true,
                1
            ),
        });

        const result = usecase.execute(input.userId, input.employee);

        expect(createSpy).toHaveBeenCalledWith([
            {
                氏名: input.employee.氏名,
                メールアドレス: input.employee.メールアドレス,
                パスワード: '',
                承認: true,
                バージョン: 1,
                relations: {
                    スタッフ: [{}],
                },
            },
        ]);

        const userId = getUuidSpy.mock.results[0].value;

        const userRecords = dataStore.get(':ユーザー').rows;
        expect(userRecords).toEqual([
            [
                userId,
                input.employee.氏名,
                input.employee.メールアドレス,
                '',
                true,
                1,
            ],
        ]);

        const employeeRecords = dataStore.get(':スタッフ').rows;
        expect(employeeRecords).toEqual([[userId]]);

        expect(result).toEqual({
            employee: {
                ユーザーID: userId,
            },
            user: {
                ID: userId,
                氏名: input.employee.氏名,
                メールアドレス: input.employee.メールアドレス,
                パスワード: '',
                承認: true,
                バージョン: 1,
            },
        });
    });
});
