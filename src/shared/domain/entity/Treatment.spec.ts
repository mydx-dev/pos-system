import { describe, expect, it } from 'vitest';
import { PaymentRecord } from './PaymentRecord';
import { Treatment } from './Treatment';
import { TreatmentMenu } from './TreatmentMenu';

describe('Treatment', () => {
    it('施術情報を取得できる', () => {
        const treatment = new Treatment(
            '123e4567-e89b-42d3-a456-426614174000',
            '223e4567-e89b-42d3-a456-426614174000',
            '323e4567-e89b-42d3-a456-426614174000',
            '予約済み',
            '2024-01-01T10:00:00.000Z',
            60,
            '備考',
            1
        );

        expect(treatment.pkValue).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(treatment.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(treatment.customerId).toBe(
            '223e4567-e89b-42d3-a456-426614174000'
        );
        expect(treatment.staffId).toBe('323e4567-e89b-42d3-a456-426614174000');
        expect(treatment.status).toBe('予約済み');
        expect(treatment.isDone).toBe(false);
        expect(treatment.startAt).toBe('2024-01-01T10:00:00.000Z');
        expect(treatment.duration).toBe(60);
        expect(treatment.note).toBe('備考');
        expect(treatment.version).toBe(1);
    });

    it('精算済みの場合は完了済みとして扱う', () => {
        const treatment = new Treatment(
            '123e4567-e89b-42d3-a456-426614174000',
            '223e4567-e89b-42d3-a456-426614174000',
            '323e4567-e89b-42d3-a456-426614174000',
            '精算済み',
            '2024-01-01T10:00:00.000Z',
            60,
            null,
            1
        );

        expect(treatment.isDone).toBe(true);
    });

    it('精算履歴から現在の売上を計算できる', () => {
        const treatment = new Treatment(
            '123e4567-e89b-42d3-a456-426614174000',
            '223e4567-e89b-42d3-a456-426614174000',
            '323e4567-e89b-42d3-a456-426614174000',
            '精算済み',
            '2024-01-01T10:00:00.000Z',
            60,
            null,
            1
        );
        treatment.addRelation(
            PaymentRecord,
            new PaymentRecord(
                '423e4567-e89b-42d3-a456-426614174000',
                treatment.id,
                '精算',
                8000,
                '現金',
                '2024-01-01T11:00:00.000Z',
                null,
                null,
                1
            )
        );
        treatment.addRelation(
            PaymentRecord,
            new PaymentRecord(
                '523e4567-e89b-42d3-a456-426614174000',
                treatment.id,
                '返金',
                3000,
                '現金',
                '2024-01-02T11:00:00.000Z',
                null,
                '423e4567-e89b-42d3-a456-426614174000',
                1
            )
        );
        treatment.addRelation(
            PaymentRecord,
            new PaymentRecord(
                '623e4567-e89b-42d3-a456-426614174000',
                treatment.id,
                '取消',
                1000,
                '現金',
                '2024-01-03T11:00:00.000Z',
                null,
                '423e4567-e89b-42d3-a456-426614174000',
                1
            )
        );

        expect(treatment.paidTotal).toBe(8000);
        expect(treatment.cancelTotal).toBe(1000);
        expect(treatment.repaymentTotal).toBe(3000);
        expect(treatment.currentSales).toBe(4000);
        expect(treatment.hasPaidPaymentRecord).toBe(true);
        expect(treatment.canCancelPayment).toBe(true);
        expect(treatment.cancelAmount).toBe(4000);
        expect(treatment.canRepay(4000)).toBe(true);
        expect(treatment.canRepay(4001)).toBe(true);
        expect(treatment.canPay(1)).toBe(true);
        expect(treatment.canPay(0)).toBe(false);
        expect(
            treatment.canUseTargetPaymentRecord(
                '423e4567-e89b-42d3-a456-426614174000'
            )
        ).toBe(true);
        expect(
            treatment.canUseTargetPaymentRecord(
                '723e4567-e89b-42d3-a456-426614174000'
            )
        ).toBe(false);
        expect(treatment.canCreatePaymentRecord('精算', 1)).toBe(true);
        expect(
            treatment.canCreatePaymentRecord(
                '取消',
                1,
                '423e4567-e89b-42d3-a456-426614174000'
            )
        ).toBe(true);
        expect(
            treatment.canCreatePaymentRecord(
                '返金',
                1,
                '423e4567-e89b-42d3-a456-426614174000'
            )
        ).toBe(true);
        expect(
            treatment.canCreatePaymentRecord(
                '返金',
                1,
                '723e4567-e89b-42d3-a456-426614174000'
            )
        ).toBe(false);
    });

    it('施術メニューを持っているか判定できる', () => {
        const treatment = new Treatment(
            '123e4567-e89b-42d3-a456-426614174000',
            '223e4567-e89b-42d3-a456-426614174000',
            '323e4567-e89b-42d3-a456-426614174000',
            '来店済み',
            '2024-01-01T10:00:00.000Z',
            60,
            null,
            1
        );
        treatment.addRelation(
            TreatmentMenu,
            new TreatmentMenu(
                '423e4567-e89b-42d3-a456-426614174000',
                treatment.id,
                '523e4567-e89b-42d3-a456-426614174000',
                'カット',
                5000,
                1,
                0,
                1,
                1
            )
        );

        expect(treatment.treatmentMenus).toHaveLength(1);
        expect(treatment.hasMenu('423e4567-e89b-42d3-a456-426614174000')).toBe(
            true
        );
        expect(treatment.hasMenu('623e4567-e89b-42d3-a456-426614174000')).toBe(
            false
        );
    });
});
