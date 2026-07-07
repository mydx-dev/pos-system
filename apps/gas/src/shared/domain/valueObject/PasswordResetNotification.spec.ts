import { NodeUtilities } from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { systemName } from '../../config';
import { PasswordResetNotification } from './PasswordResetNotification';

describe('パスワードリセット通知の生成', () => {
    const token = '123e4567-e89b-12d3-a456-426614174000';
    const serviceUrl = `https://example.com`;
    const utilities = new NodeUtilities();

    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    const expiredAt = utilities.formatDate(
        new Date(Date.now() + 30 * 60 * 1000),
        'Asia/Tokyo',
        'yyyy/MM/dd HH:mm:ss'
    );

    const notification = new PasswordResetNotification(
        token,
        serviceUrl,
        expiredAt,
        systemName
    );

    it('タイトルはパスワードリセット', () => {
        expect(notification.title).toBe(`${systemName} パスワードリセット`);
    });

    it('本文はテンプレートに従う', () => {
        expect(notification.body).toBe(
            `以下のURLをクリックして、パスワードをリセットしてください。\n\n${serviceUrl}#/reset-password/?token=${token}\n\nこのURLの有効期限は30分間です。（${expiredAt}まで）\n一時的なもので、他人に知られないようにしてください。`
        );
    });
});
