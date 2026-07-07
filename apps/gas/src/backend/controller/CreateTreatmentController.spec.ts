import {
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { context } from '../../../tests/contexts/createTreatmentTestContext';
import { CreateTreatmentRequest } from '@mydx-pos/shared/api/treatment';

function correctInput(): CreateTreatmentRequest {
    return {
        sessionToken: 'valid-session-token',
        treatment: {
            顧客ID: '11111111-1111-4111-8111-111111111111',
            担当スタッフID: '22222222-2222-4222-8222-222222222222',
            開始日時: '2026-07-02T10:00:00.000Z',
            所要時間: 60,
            備考: null,
        },
        treatmentMenus: [],
    };
}

describe('バリデーション', () => {
    it('セッショントークンが空の場合はエラー', () => {
        const {
            createTreatment: { controller },
        } = context();
        const input = correctInput();
        input.sessionToken = undefined as unknown as string;

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });

    it('値引き額が0未満の場合はエラー', () => {
        const {
            createTreatment: { controller },
        } = context();
        const input = correctInput();
        input.treatmentMenus = [
            {
                メニューID: '33333333-3333-4333-8333-333333333333',
                数量: 1,
                値引き額: -1,
                表示順: 1,
            },
        ];

        expect(() => controller.execute(input)).toThrow(InvalidArgumentError);
    });
});

describe('認証', () => {
    it('認証に失敗した場合はエラー', () => {
        const {
            createTreatment: { controller },
            authSpy,
        } = context();
        const input = correctInput();
        authSpy.mockImplementation(() => {
            throw new Error('Invalid session token');
        });

        expect(() => controller.execute(input)).toThrow(UnauthorizedError);
    });
});

describe('施術登録', () => {
    it('施術登録ユースケースを実行する', () => {
        const {
            createTreatment: { controller, usecaseSpy },
            authSpy,
        } = context();
        const input = correctInput();
        authSpy.mockReturnValue('valid-user-id');
        usecaseSpy.mockReturnValue({
            treatment: {
                ID: '44444444-4444-4444-8444-444444444444',
                顧客ID: input.treatment.顧客ID,
                担当スタッフID: input.treatment.担当スタッフID,
                状態: '予約済み',
                開始日時: input.treatment.開始日時,
                所要時間: 60,
                終了日時: '2026-07-02T11:00:00.000Z',
                備考: null,
                バージョン: 1,
            },
            treatmentMenus: [],
        });

        controller.execute(input);

        expect(usecaseSpy).toHaveBeenCalledWith('valid-user-id', input);
    });
});
