import { describe, expect, it } from 'vitest';
import { hashPassword, hashToken, randomToken } from './crypto';

describe('auth crypto helpers', () => {
    it('hashes passwords deterministically with user salt and pepper', async () => {
        const hash = await hashPassword(
            'Password1',
            '00000000-0000-4000-8000-000000000001',
            '00000000-0000-4000-8000-000000000000'
        );

        expect(hash).toBe(
            await hashPassword(
                'Password1',
                '00000000-0000-4000-8000-000000000001',
                '00000000-0000-4000-8000-000000000000'
            )
        );
        expect(hash).toMatch(/^pbkdf2_sha256\$210000\$/);
    });

    it('hashes session tokens without storing the raw token', async () => {
        const token = randomToken();

        expect(token).not.toBe(await hashToken(token));
    });
});
