import {
    ForbiddenError,
    InMemoryDataStore,
    InMemoryGateway,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { UnapproveUserUseCase } from './UnapproveUserUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    const unapproveUserUseCase = new UnapproveUserUseCase(db);
    return unapproveUserUseCase;
}

function getDependencies(usecase: UnapproveUserUseCase) {
    const findSpy = vi.spyOn(usecase['db'].table('ユーザー'), 'find');
    const updateSpy = vi.spyOn(usecase['db'].table('ユーザー'), 'update');
    return { findSpy, updateSpy };
}

function getCorrectInput() {
    return {
        executorId: '1',
        user: {
            ID: '2',
            氏名: 'Test User',
            メールアドレス: 'test@example.com',
            パスワード: '',
            承認: true,
            バージョン: 1,
        },
    };
}

describe('バリデーション', () => {
    it('ユーザーIDが文字列ではない場合、エラーが発生すること', () => {
        const unapproveUserUseCase = factory();
        const { user } = getCorrectInput();
        expect(() =>
            unapproveUserUseCase.execute(undefined as unknown as string, user)
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    it('実行者が存在しない場合、ForbiddenErrorが発生すること', () => {
        const unapproveUserUseCase = factory();
        const { findSpy } = getDependencies(unapproveUserUseCase);
        findSpy.mockReturnValueOnce([]);
        const { executorId, user } = getCorrectInput();
        expect(() => unapproveUserUseCase.execute(executorId, user)).toThrow(
            ForbiddenError
        );
    });

    it('実行者が管理者でない場合、ForbiddenErrorが発生すること', () => {
        const unapproveUserUseCase = factory();
        const { findSpy } = getDependencies(unapproveUserUseCase);
        const { executorId, user } = getCorrectInput();
        const normalUser = new User(
            'not-executor-id',
            'Test User',
            'test@example.com',
            'ValidPass123',
            true,
            1
        );
        normalUser.addRelation(Role, new Role(normalUser.id, 'ユーザー'));
        findSpy.mockReturnValueOnce([normalUser]);
        expect(() => unapproveUserUseCase.execute(executorId, user)).toThrow(
            ForbiddenError
        );
    });

    it('実行者が管理者であるが承認されていない場合、ForbiddenErrorが発生すること', () => {
        const unapproveUserUseCase = factory();
        const { findSpy } = getDependencies(unapproveUserUseCase);
        const { executorId, user } = getCorrectInput();
        const unapprovedAdminUser = new User(
            executorId,
            'Unapproved Admin User',
            'unapproved-admin@example.com',
            'ValidPass123',
            false,
            1
        );
        unapprovedAdminUser.addRelation(
            Role,
            new Role(unapprovedAdminUser.id, 'システム管理者')
        );
        findSpy.mockReturnValueOnce([unapprovedAdminUser]);
        expect(() => unapproveUserUseCase.execute(executorId, user)).toThrow(
            ForbiddenError
        );
    });

    it('実行者が管理者かつ承認済みである場合、ForbiddenErrorが発生しないこと', () => {
        const unapproveUserUseCase = factory();
        const { findSpy } = getDependencies(unapproveUserUseCase);
        const { executorId, user } = getCorrectInput();
        const adminUser = new User(
            executorId,
            'Admin User',
            'admin@example.com',
            'ValidPass123',
            true,
            1
        );
        adminUser.addRelation(Role, new Role(adminUser.id, 'システム管理者'));
        findSpy.mockReturnValueOnce([adminUser]);
        expect(() =>
            unapproveUserUseCase.execute(executorId, user)
        ).not.toThrow(ForbiddenError);
    });
});

describe('ユーザーの承認を外してDBを更新する', () => {
    const unapproveUserUseCase = factory();
    const { findSpy, updateSpy } = getDependencies(unapproveUserUseCase);
    const { executorId, user } = getCorrectInput();
    const adminUser = new User(
        executorId,
        'Admin User',
        'admin@example.com',
        'ValidPass123',
        true,
        1
    );
    adminUser.addRelation(Role, new Role(adminUser.id, 'システム管理者'));

    const approvedUser = new User(
        user.ID,
        user.氏名,
        user.メールアドレス,
        user.パスワード,
        user.承認,
        user.バージョン
    );

    findSpy.mockReturnValue([adminUser, approvedUser]);
    const unapprovedUser = new User(
        user.ID,
        user.氏名,
        user.メールアドレス,
        user.パスワード,
        false, // 承認を外す
        user.バージョン + 1
    );
    updateSpy.mockReturnValue([unapprovedUser]);
    const result = unapproveUserUseCase.execute(executorId, user);

    it('正常にユーザーの承認を外した状態で、DBの更新を実行する', () => {
        unapprovedUser['_version'] = user.バージョン; // 呼び出す時はまだバージョンは更新されていない
        expect(updateSpy).toHaveBeenCalledWith([unapprovedUser]);
    });

    it('承認を外され、バージョンが更新されたユーザーが返却される（パスワードは空文字）', () => {
        expect(result).toEqual({
            ID: unapprovedUser.id,
            氏名: unapprovedUser.name,
            メールアドレス: unapprovedUser.email,
            パスワード: '',
            承認: unapprovedUser.approval,
            バージョン: unapprovedUser.version + 1,
        });
    });
});

describe('DB保存の失敗', () => {
    it('DBの更新に失敗した場合、エラーが発生すること', () => {
        const unapproveUserUseCase = factory();
        const { findSpy, updateSpy } = getDependencies(unapproveUserUseCase);
        const { executorId, user } = getCorrectInput();
        const adminUser = new User(
            executorId,
            'Admin User',
            'admin@example.com',
            'ValidPass123',
            true,
            1
        );
        adminUser.addRelation(Role, new Role(adminUser.id, 'システム管理者'));

        const unapprovedUser = new User(
            '2',
            'Test User',
            'test@example.com',
            '',
            false,
            1
        );

        findSpy.mockReturnValue([adminUser, unapprovedUser]);
        updateSpy.mockImplementation(() => {
            throw new Error('DB update failed');
        });

        expect(() => unapproveUserUseCase.execute(executorId, user)).toThrow(
            'DB update failed'
        );
    });
});
