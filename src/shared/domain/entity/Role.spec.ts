import { describe, expect, it } from 'vitest';
import { Role } from './Role';

describe('初期化', () => {
    it('ユーザーID、名前を持つ', () => {
        const userId = '123e4567-e89b-42d3-a456-426614174000';
        const name = 'システム管理者';

        const permission = new Role(userId, name);

        expect(permission.userId).toBe(userId);
        expect(permission.name).toBe(name);
    });
});

it('pkの取得', () => {
    const userId = '123e4567-e89b-42d3-a456-426614174000';
    const permission = new Role(userId, 'システム管理者');

    expect(permission.pkValue).toBe(userId);
});
