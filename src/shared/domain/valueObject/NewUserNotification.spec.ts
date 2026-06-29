import { describe, expect, it } from 'vitest';
import { NewUserNotification } from './NewUserNotification';

describe('新規ユーザー通知', () => {
    const url = `https://script.google.com/macros/s/AKfycbx1234567890/exec`;
    const uuid = '123e4567-e89b-42d3-a456-426614174000';
    const notification = new NewUserNotification(
        uuid,
        url,
        'Test User',
        'test-user@example.com',
        ['system-admin@example.com']
    );
    it('新規ユーザーが作成された時に、システム管理者に通知する', () => {
        expect(notification.recipients).toEqual(['system-admin@example.com']);
    });
    it('通知のタイトルは「新規ユーザーが作成されました」とする', () => {
        expect(notification.title).toBe('新規ユーザーが作成されました');
    });
    it('通知の本文はテンプレートに従う', () => {
        expect(notification.body).toBe(`システム管理者各位

新規ユーザーがシステムに追加されました。

氏名: Test User
メールアドレス: test-user@example.com

こちらのURLから承認できます。
${url}#/users/${uuid}`);
    });
});
