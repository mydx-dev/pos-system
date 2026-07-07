import { describe, expect, it } from 'vitest';
import { UserPassword } from './UserPassword';

describe('初期化', () => {
    it('８文字以下の場合はエラーになる', () => {
        const password = 'Passwrd';
        expect(() => new UserPassword(password)).toThrow(
            'Password must be at least 8 characters long'
        );
    });

    it('英語大文字が含まれていない場合はエラーになる', () => {
        const password = 'password123';
        expect(() => new UserPassword(password)).toThrow(
            'Invalid password format'
        );
    });

    it('英語小文字が含まれていない場合はエラーになる', () => {
        const password = 'PASSWORD123';
        expect(() => new UserPassword(password)).toThrow(
            'Invalid password format'
        );
    });

    it('数字が含まれていない場合はエラーになる', () => {
        const password = 'Password';
        expect(() => new UserPassword(password)).toThrow(
            'Invalid password format'
        );
    });

    it('有効なパスワードの場合は正常に初期化される', () => {
        const password = 'ValidPass123';
        const userPassword = new UserPassword(password);
        expect(userPassword.value).toBe(password);
    });
});
