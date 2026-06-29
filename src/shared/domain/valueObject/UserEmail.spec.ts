import { describe, expect, it } from 'vitest';
import { UserEmail } from './UserEmail';

describe('初期化', () => {
    it('有効なメールアドレスの場合は正常に初期化される', () => {
        const email = 'test@example.com';
        const userEmail = new UserEmail(email);
        expect(userEmail.value).toBe(email);
    });

    it('無効なメールアドレスの場合はエラーになる', () => {
        const email = 'invalid-email';
        expect(() => new UserEmail(email)).toThrow('Invalid email format');
    });
});
