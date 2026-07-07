import { InvalidArgumentError } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { TreatmentStartDate } from './TreatmentStartDate';

describe('TreatmentStartDate', () => {
    it('開始日時が15分単位の場合はDateを保持する', () => {
        const startDate = new TreatmentStartDate('2026-07-02T10:15:00.000Z');

        expect(startDate.value.toISOString()).toBe('2026-07-02T10:15:00.000Z');
    });

    it('開始日時が不正な日時の場合はエラー', () => {
        expect(() => new TreatmentStartDate('invalid-date')).toThrow(
            InvalidArgumentError
        );
    });

    it('開始日時が15分単位ではない場合はエラー', () => {
        expect(
            () => new TreatmentStartDate('2026-07-02T10:10:00.000Z')
        ).toThrow(InvalidArgumentError);
    });
});
