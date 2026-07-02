import { describe, expect, it } from 'vitest';
import { Treatment } from './Treatment';

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
});
