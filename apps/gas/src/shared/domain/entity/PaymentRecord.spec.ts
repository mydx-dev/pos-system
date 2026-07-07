import { describe, expect, it } from 'vitest';
import { PaymentRecord } from './PaymentRecord';

describe('PaymentRecord', () => {
    it('ID、施術ID、種別、金額、支払方法、発生日時、備考、対象精算ID、バージョンを指定して初期化できる', () => {
        const paymentRecord = new PaymentRecord(
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
            '精算',
            8000,
            '現金',
            '2026-07-02T10:00:00.000Z',
            '備考',
            null,
            1
        );

        expect(paymentRecord.pkValue).toBe(
            '11111111-1111-4111-8111-111111111111'
        );
        expect(paymentRecord.id).toBe('11111111-1111-4111-8111-111111111111');
        expect(paymentRecord.treatmentId).toBe(
            '22222222-2222-4222-8222-222222222222'
        );
        expect(paymentRecord.type).toBe('精算');
        expect(paymentRecord.isPaid).toBe(true);
        expect(paymentRecord.isCancel).toBe(false);
        expect(paymentRecord.isRepayment).toBe(false);
        expect(paymentRecord.amount).toBe(8000);
        expect(paymentRecord.paymentMethod).toBe('現金');
        expect(paymentRecord.occurredAt).toBe('2026-07-02T10:00:00.000Z');
        expect(paymentRecord.note).toBe('備考');
        expect(paymentRecord.targetPaymentRecordId).toBeNull();
        expect(paymentRecord.version).toBe(1);
    });
});
