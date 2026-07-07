import {
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it, vi } from 'vitest';
import { context } from '../../../tests/contexts/createEmployeeTestContext';
import { CreateEmployeeInput } from '../../shared/api/employee';

function correctInput(): CreateEmployeeInput {
    return {
        sessionToken: 'valid-session-token',
        employee: {
            氏名: 'valid-user-id',
            メールアドレス: 'valid-email@example.com',
        },
    };
}

describe('バリデーション', () => {
    it('ユーザーIDが空の場合はエラー', () => {
        const {
            createEmployee: { controller },
        } = context();
        const input = correctInput();
        input.sessionToken = undefined as unknown as string;
        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合は、エラーを返す', () => {
        const {
            createEmployee: { controller },
            authSpy,
        } = context();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });
        const input = correctInput();
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('ユーザー作成', () => {
    it('ユーザー作成を呼び出し、作成されたユーザーIDで従業員作成ユースケースを実行する', () => {
        const {
            scope,
            createEmployee: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = correctInput();

        authSpy.mockReturnValue('valid-user-id');

        const forgotPasswordUseCaseSpy = vi
            .spyOn(scope.resolve('forgotPasswordUseCase'), 'execute')
            .mockReturnValue({
                ok: true,
            });

        usecaseSpy.mockReturnValue({
            user: {
                ID: 'new-user-id',
                氏名: input.employee.氏名,
                メールアドレス: input.employee.メールアドレス,
                パスワード: '',
                承認: true,
                バージョン: 1,
            },
            employee: {
                ユーザーID: 'new-user-id',
            },
        });

        controller.execute(input);
        expect(forgotPasswordUseCaseSpy).toHaveBeenCalledWith(
            input.employee.メールアドレス
        );

        expect(usecaseSpy).toHaveBeenCalledWith(
            'valid-user-id',
            input.employee
        );
    });
});
