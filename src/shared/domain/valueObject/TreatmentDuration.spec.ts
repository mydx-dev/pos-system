import { InvalidArgumentError } from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, it } from 'vitest';
import { TreatmentDuration } from './TreatmentDuration';

describe('TreatmentDuration', () => {
    it('所要時間が15分単位の場合は分数を保持する', () => {
        const duration = new TreatmentDuration(60);

        expect(duration.value).toBe(60);
    });

    it('所要時間が0分未満の場合はエラー', () => {
        expect(() => new TreatmentDuration(-15)).toThrow(InvalidArgumentError);
    });

    it('所要時間が15分単位ではない場合はエラー', () => {
        expect(() => new TreatmentDuration(50)).toThrow(InvalidArgumentError);
    });
});
