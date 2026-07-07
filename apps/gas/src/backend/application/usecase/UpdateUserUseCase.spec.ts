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
import { UpdateUserUseCase } from './UpdateUserUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    const usecase = new UpdateUserUseCase(db);
    return usecase;
}

function getDependencies(usecase: UpdateUserUseCase) {
    const executeSpy = vi.spyOn(usecase, 'execute');
    const findSpy = vi.spyOn(usecase['db'], 'find');
    const updateSpy = vi.spyOn(usecase['db'].table('ユーザー'), 'update');
    return { executeSpy, findSpy, updateSpy };
}

function createValidUser() {
    const user = {
        ID: '123e4567-e89b-42d3-a456-426614174000',
        氏名: 'Test User',
        メールアドレス: 'test@example.com',
        パスワード: 'password',
        承認: true,
        バージョン: 1,
    };
    return user;
}

function createAdmin() {
    const admin = new User(
        'executor-user-id',
        'Admin User',
        'admin@example.com',
        'password',
        true,
        1
    );
    admin.addRelation(Role, new Role('executor-user-id', 'システム管理者'));
    return admin;
}

describe('バリデーション', () => {
    it('実行者のユーザーIDがないとユーザーを更新できない', () => {
        const usecase = factory();
        const user = createValidUser();
        expect(() =>
            usecase.execute(undefined as unknown as string, user)
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    describe('自分の情報を更新する場合', () => {
        it('ForbiddenErrorは出ない', () => {
            const usecase = factory();
            const userParams = createValidUser();
            const user = new User(
                userParams.ID,
                userParams.氏名,
                userParams.メールアドレス,
                userParams.パスワード,
                userParams.承認,
                userParams.バージョン
            );
            const executorId = userParams.ID;
            const { findSpy, updateSpy } = getDependencies(usecase);
            findSpy.mockReturnValue([user]);
            updateSpy.mockReturnValue([]);
            expect(() => {
                usecase.execute(executorId, userParams);
            }).not.toThrow(ForbiddenError);
        });
    });

    describe('他人の情報を更新する場合', () => {
        it('自分が管理者であればユーザーを更新できる', () => {
            const usecase = factory();
            const userParams = createValidUser();
            const adminUser = createAdmin();
            const executorId = 'executor-user-id';
            const { findSpy, updateSpy } = getDependencies(usecase);
            findSpy.mockReturnValue([adminUser]);
            updateSpy.mockReturnValue([]);
            expect(() => {
                usecase.execute(executorId, userParams);
            }).not.toThrow(ForbiddenError);
        });
        it('自分が管理者でなければユーザーを更新できない', () => {
            const usecase = factory();
            const executorId = 'executor-user-id';
            const userParams = createValidUser();
            const normalUser = new User(
                executorId,
                userParams.氏名,
                userParams.メールアドレス,
                userParams.パスワード,
                userParams.承認,
                userParams.バージョン
            );
            normalUser.addRelation(Role, new Role(executorId, 'ユーザー'));
            const { findSpy, updateSpy } = getDependencies(usecase);
            findSpy.mockReturnValue([normalUser]);
            updateSpy.mockReturnValue([]);
            expect(() => {
                usecase.execute(executorId, userParams);
            }).toThrow(ForbiddenError);
        });
    });
});

describe('シーケンス', () => {
    it('管理者としてユーザー更新処理を呼び出し、更新したユーザーを取得する', () => {
        const usecase = factory();
        const { findSpy, updateSpy } = getDependencies(usecase);
        const userParams = createValidUser();
        const executorId = 'executor-user-id';
        const admin = new User(
            executorId,
            'Admin User',
            'admin@example.com',
            'password',
            true,
            1
        );
        admin.addRelation(Role, new Role(userParams.ID, 'システム管理者'));
        const targetUser = new User(
            userParams.ID,
            userParams.氏名,
            userParams.メールアドレス,
            userParams.パスワード,
            userParams.承認,
            userParams.バージョン
        );
        findSpy.mockReturnValue([admin, targetUser]);
        targetUser['_version'] = userParams.バージョン + 1;
        updateSpy.mockReturnValue([targetUser]);

        const result = usecase.execute(executorId, userParams);
        expect(result).toEqual({
            ID: userParams.ID,
            氏名: userParams.氏名,
            メールアドレス: userParams.メールアドレス,
            パスワード: '',
            承認: userParams.承認,
            バージョン: userParams.バージョン + 1,
        });
    });

    it('自分自身としてユーザー更新処理を呼び出し、更新したユーザーを取得する', () => {
        const usecase = factory();
        const { findSpy, updateSpy } = getDependencies(usecase);
        const userParams = createValidUser();
        const beforeUser = new User(
            userParams.ID,
            userParams.氏名,
            userParams.メールアドレス,
            userParams.パスワード,
            userParams.承認,
            userParams.バージョン
        );
        const executorId = userParams.ID;
        findSpy.mockReturnValue([beforeUser]);
        beforeUser['_version'] = userParams.バージョン + 1;
        updateSpy.mockReturnValue([beforeUser]);

        const result = usecase.execute(executorId, userParams);
        expect(result).toEqual({
            ID: userParams.ID,
            氏名: userParams.氏名,
            メールアドレス: userParams.メールアドレス,
            パスワード: '',
            承認: userParams.承認,
            バージョン: userParams.バージョン + 1,
        });
    });
});
