import { describe, expect, it, vi } from 'vitest';
import { PasswordReset } from './PasswordReset';

describe('初期化', () => {
    it('ユーザーID、トークン、有効期限を持つ', () => {
        const userId = '1';
        const token = '123e4567-e89b-12d3-a456-426614174000';
        const expiresAt = Date.now() + 3600 * 1000; // 1時間後

        const passwordReset = new PasswordReset(userId, token, expiresAt);

        expect(passwordReset.userId).toBe(userId);
        expect(passwordReset.token).toBe(token);
        expect(passwordReset.expiresAt).toBe(expiresAt);
    });
});

describe('PK値の取得', () => {
    it('トークンをPK値として返す', () => {
        const userId = '1';
        const token = '123e4567-e89b-12d3-a456-426614174000';
        const expiresAt = Date.now() + 3600 * 1000; // 1時間後

        const passwordReset = new PasswordReset(userId, token, expiresAt);

        expect(passwordReset.pkValue).toBe(token);
    });
});

describe('有効期限判定', () => {
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0)); // 現在時刻を2024-01-01 12:00:00に固定
    it('有効期限が現在のちょうど30分後の場合は有効', () => {
        const passwordReset = new PasswordReset(
            '1',
            '123e4567-e89b-12d3-a456-426614174000',
            Date.now() + 30 * 60 * 1000 // 2024-01-01 12:30:00:000
        );
        expect(passwordReset.isValid(Date.now())).toBe(true);
    });

    it('現在時刻が有効期限より1秒後の場合は無効', () => {
        const passwordReset = new PasswordReset(
            '1',
            '123e4567-e89b-12d3-a456-426614174000',
            Date.now()
        );
        expect(passwordReset.isValid(Date.now() + 1)).toBe(false);
    });
});
