import { describe, expect, it } from 'vitest';
import { hashPassword, hashToken, randomToken } from './crypto';

describe('auth crypto helpers', () => {
    it('hashes passwords deterministically with user salt and pepper', async () => {
        await expect(
            hashPassword(
                'Password1',
                '00000000-0000-4000-8000-000000000001',
                '00000000-0000-4000-8000-000000000000'
            )
        ).resolves.toBe(
            await hashPassword(
                'Password1',
                '00000000-0000-4000-8000-000000000001',
                '00000000-0000-4000-8000-000000000000'
            )
        );
    });

    it('hashes session tokens without storing the raw token', async () => {
        const token = randomToken();

        expect(token).not.toBe(await hashToken(token));
    });
});
