import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { zocker } from 'zocker';
import { context } from '../../../tests/contexts/createPaymentRecordTestContext';
import {
    createPaymentRecordRequest,
    createPaymentRecordResponse,
} from '@mydx-pos/shared/api/paymentRecord';

describe('バリデーション', () => {
    it('レジ端末トークンが空の場合はエラー', () => {
        const {
            createPaymentRecord: { controller },
        } = context();
        const input = zocker(createPaymentRecordRequest).generate();
        input.registerTerminalToken = undefined as unknown as string;
        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合は、エラーを返す', () => {
        const {
            createPaymentRecord: { controller },
            registerTerminalAuthSpy,
        } = context();
        registerTerminalAuthSpy.mockImplementation(() => {
            throw new Error('Invalid register terminal token');
        });
        const input = zocker(createPaymentRecordRequest).generate();
        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('精算履歴作成成功', () => {
    it('精算履歴作成ユースケースを呼び出す', () => {
        const {
            createPaymentRecord: { controller, usecaseSpy },
            registerTerminalAuthSpy,
        } = context();
        const input = zocker(createPaymentRecordRequest).generate();

        registerTerminalAuthSpy.mockReturnValue();
        const response = zocker(createPaymentRecordResponse).generate();
        usecaseSpy.mockReturnValue(response);
        const result = controller.execute(input);

        expect(registerTerminalAuthSpy).toHaveBeenCalledWith(
            input.registerTerminalToken
        );
        expect(usecaseSpy).toHaveBeenCalledWith(input);
        expect(result).toEqual(new AppsScriptServerResponse(response));
    });
});

describe('精算履歴作成失敗', () => {
    it('精算履歴作成ユースケースでエラーが発生した場合は、エラーを返す', () => {
        const {
            createPaymentRecord: { controller, usecaseSpy },
            registerTerminalAuthSpy,
        } = context();
        const input = zocker(createPaymentRecordRequest).generate();

        registerTerminalAuthSpy.mockReturnValue();
        usecaseSpy.mockImplementation(() => {
            throw new Error('Failed to create payment record');
        });

        expect(() => controller.execute(input)).toThrow(
            'Failed to create payment record'
        );
    });
});
