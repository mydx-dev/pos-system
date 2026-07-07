import { describe, expect, it } from 'vitest';
import { TreatmentDuration } from './TreatmentDuration';
import { TreatmentEndDate } from './TreatmentEndDate';
import { TreatmentStartDate } from './TreatmentStartDate';

describe('TreatmentEndDate', () => {
    it('開始日時と所要時間から終了日時を算出する', () => {
        const startDate = new TreatmentStartDate('2026-07-02T10:00:00.000Z');
        const duration = new TreatmentDuration(75);
        const endDate = new TreatmentEndDate(startDate, duration);

        expect(endDate.value).toBe('2026-07-02T11:15:00.000Z');
    });
});
