import { describe, expect, it } from 'vitest';
import { Employee } from './Employee';

describe('初期化', () => {
    it('ユーザーIDを持つ', () => {
        const employee = new Employee('userId');
        expect(employee.pkValue).toBe('userId');
        expect(employee.userId).toBe('userId');
    });
});

describe('pkValueの取得', () => {
    it('pkValueが取得できる', () => {
        const employee = new Employee('userId');
        expect(employee.pkValue).toBe('userId');
    });
});
