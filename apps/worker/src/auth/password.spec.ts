import { describe, expect, it } from 'vitest';
import { validatePassword } from './password';

describe('validatePassword', () => {
    it('accepts a password with uppercase, lowercase, and numbers', () => {
        expect(validatePassword('Password1')).toBeNull();
    });

    it('rejects short passwords', () => {
        expect(validatePassword('Pass1')).toContain('at least 8 characters');
    });

    it('rejects passwords without required character classes', () => {
        expect(validatePassword('password')).toContain('uppercase');
    });
});
