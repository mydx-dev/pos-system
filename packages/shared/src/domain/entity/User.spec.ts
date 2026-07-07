import { describe, expect, it } from 'vitest';
import { Role } from './Role';
import { User } from './User';

describe('初期化', () => {
    it('ID、氏名、メールアドレス、パスワード、承認、バージョンを持つ', () => {
        const id = '123e4567-e89b-42d3-a456-426614174000';
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'ValidPass123';
        const approval = true;
        const version = 1;

        const user = new User(id, name, email, password, approval, version);

        expect(user.id).toBe(id);
        expect(user.name).toBe(name);
        expect(user.email).toBe(email);
        expect(user.password).toBe(password);
        expect(user.approval).toBe(approval);
        expect(user.version).toBe(version);
        expect(user.role).toEqual([]);
    });

    it('権限を持つ', () => {
        const user = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );

        user.addRelation(Role, new Role(user.id, 'システム管理者'));
        expect(user.role).toHaveLength(1);
        expect(user.role).toContainEqual('システム管理者');
    });
});

it('pkの取得', () => {
    const user = new User(
        '123e4567-e89b-42d3-a456-426614174000',
        'Test User',
        'test@example.com',
        'ValidPass123',
        true,
        1
    );

    expect(user.pkValue).toBe('123e4567-e89b-42d3-a456-426614174000');
});

describe('管理者判定', () => {
    it('管理者権限を持っている場合は管理者', () => {
        const user = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );

        user.addRelation(Role, new Role(user.id, 'システム管理者'));
        expect(user.isAdmin()).toBe(true);
    });

    it('管理者権限を持っていない場合は管理者でない', () => {
        const user = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );

        expect(user.isAdmin()).toBe(false);
    });

    it('権限が何もない場合は管理者でない', () => {
        const user = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );

        expect(user.isAdmin()).toBe(false);
    });
});

it('パスワードを空にしてシリアライズできる', () => {
    const user = new User(
        '123e4567-e89b-42d3-a456-426614174000',
        'Test User',
        'test@example.com',
        'ValidPass123',
        true,
        1
    );

    const record = user.serializeEmptyPassword();
    expect(record).toEqual({
        ID: '123e4567-e89b-42d3-a456-426614174000',
        氏名: 'Test User',
        メールアドレス: 'test@example.com',
        パスワード: '',
        承認: true,
        バージョン: 1,
    });
});

describe('パスワードの検証', () => {
    const user = new User(
        '123e4567-e89b-42d3-a456-426614174000',
        'Test User',
        'test@example.com',
        'ValidPass123',
        true,
        1
    );
    it('パスワードが同じ場合はtrueを返す', () => {
        expect(user.verifyPassword('ValidPass123')).toBe(true);
    });

    it('パスワードが異なる場合はfalseを返す', () => {
        expect(user.verifyPassword('InvalidPass123')).toBe(false);
    });
});

describe('ユーザーを承認する', () => {
    const unapprovedUser = new User(
        '123e4567-e89b-42d3-a456-426614174000',
        'Test User',
        'test@example.com',
        'ValidPass123',
        false,
        1
    );

    it('ユーザーを承認できる', () => {
        expect(unapprovedUser.approval).toBe(false);
        unapprovedUser.approve();
        expect(unapprovedUser.approval).toBe(true);
    });
});

describe('ユーザーの承認を取り消す', () => {
    it('元々承認されているユーザーの承認を取り消すことができる', () => {
        const user = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );
        expect(user.approval).toBe(true);
        user.unapprove();
        expect(user.approval).toBe(false);
    });

    it('元々承認されていないユーザーはそのまま承認されない', () => {
        const unapprovedUser = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'test@example.com',
            'ValidPass123',
            false,
            1
        );

        expect(unapprovedUser.approval).toBe(false);
        unapprovedUser.unapprove();
        expect(unapprovedUser.approval).toBe(false);
    });
});

describe('パスワードリセット', () => {
    const user = new User(
        '123e4567-e89b-42d3-a456-426614174000',
        'Test User',
        'test@example.com',
        'ValidPass123',
        true,
        1
    );

    it('パスワードを更新できる', () => {
        const newPassword = 'NewValidPass123';
        user.resetPassword(newPassword);
        expect(user.password).toBe(newPassword);
    });
});
