import {
    ForbiddenError,
    InMemoryDataStore,
    InMemoryGateway,
    InvalidArgumentError,
    NotFoundError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    InMemoryPropertiesService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { User } from '../../../shared/domain/entity/User';
import { PasswordProtection } from '../../application/service/PasswordProtection';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { ResetPasswordUseCase } from './ResetPasswordUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    ALL_TABLES.forEach((table) =>
        dataStore.set(`:${table.name}`, [Object.keys(table.schema.shape)])
    );
    const gateway = new InMemoryGateway(dataStore);
    const utilities = new NodeUtilities();
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        utilities
    );
    const passwordProtection = new PasswordProtection(
        utilities,
        new InMemoryPropertiesService().getScriptProperties()
    );

    return new ResetPasswordUseCase(db, passwordProtection);
}

function getDependencies(usecase: ResetPasswordUseCase) {
    const execute = vi.spyOn(usecase, 'execute');
    const findSpy = vi.spyOn(usecase['db'], 'find');
    const passwordProtectionSpy = vi.spyOn(
        usecase['passwordProtection'],
        'execute'
    );
    const updateSpy = vi.spyOn(usecase['db'].table('ユーザー'), 'update');
    return { execute, findSpy, passwordProtectionSpy, updateSpy };
}

function createValidPasswordReset() {
    const now = Date.now();
    return new PasswordReset('user1', 'validToken', now + 1000 * 60 * 60); // 1時間有効
}

function userFactory() {
    const user = new User(
        'user1',
        'Test User',
        'test@example.com',
        'hashedPassword',
        true,
        1
    );
    return user;
}

describe('バリデーション', () => {
    it('トークンがないとパスワードをリセットできない', () => {
        const usecase = factory();
        expect(() =>
            usecase.execute(undefined as unknown as string, 'newPassword')
        ).toThrow(InvalidArgumentError);
    });

    it('新しいパスワードがないとパスワードをリセットできない', () => {
        const usecase = factory();
        expect(() =>
            usecase.execute('validToken', undefined as unknown as string)
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    it('パスワードリセットが存在しないとリセットできない', () => {
        const usecase = factory();
        const { findSpy } = getDependencies(usecase);
        findSpy.mockReturnValue([]);
        expect(() =>
            usecase.execute('nonExistentToken', 'newPassword')
        ).toThrow(ForbiddenError);
    });
    it('パスワードリセットの有効期限が切れている場合パスワードをリセットできない', () => {
        const usecase = factory();
        const { findSpy } = getDependencies(usecase);
        vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        const expiredReset = new PasswordReset(
            'user1',
            'expiredToken',
            Date.now() - 1000 // すでに期限切れ
        );
        findSpy.mockReturnValue([expiredReset]);
        expect(() => usecase.execute('expiredToken', 'newPassword')).toThrow(
            ForbiddenError
        );
    });
});

describe('パスワードを更新する', () => {
    it('ユーザーが見つからない場合はエラー', () => {
        const usecase = factory();
        const { findSpy } = getDependencies(usecase);
        findSpy.mockReturnValueOnce([createValidPasswordReset()]);
        findSpy.mockReturnValueOnce([]); // ユーザーが見つからない
        expect(() => usecase.execute('validToken', 'newPassword')).toThrow(
            NotFoundError
        );
    });

    describe('正常系', () => {
        // 有効なパスワードリセットを取得
        const usecase = factory();
        const { findSpy, passwordProtectionSpy, updateSpy } =
            getDependencies(usecase);
        // パスワードをリセットする
        const newPassword = 'newPassword';
        const hashedNewPassword = 'hashedNewPassword';
        passwordProtectionSpy.mockReturnValue(hashedNewPassword);

        it('パスワードのハッシュを呼び出す', () => {
            findSpy.mockReturnValueOnce([createValidPasswordReset()]);
            // ユーザーを取得する
            const user = userFactory();
            findSpy.mockReturnValueOnce([user]);
            updateSpy.mockReturnValue([]);
            usecase.execute('validToken', newPassword);
            expect(passwordProtectionSpy).toHaveBeenCalledWith(
                newPassword,
                user.id
            );
        });

        it('新しいパスワードをDBに保存する', () => {
            findSpy.mockReturnValueOnce([createValidPasswordReset()]);
            // ユーザーを取得する
            const user = userFactory();
            findSpy.mockReturnValueOnce([user]);
            usecase.execute('validToken', newPassword);
            user.resetPassword(hashedNewPassword);

            expect(updateSpy).toHaveBeenCalledWith([user]);
        });

        it('正常に完了したレスポンスを返却する', () => {
            findSpy.mockReturnValueOnce([createValidPasswordReset()]);
            // ユーザーを取得する
            const user = userFactory();
            findSpy.mockReturnValueOnce([user]);
            const result = usecase.execute('validToken', newPassword);
            expect(result).toEqual({ ok: true });
        });
    });

    it('失敗した場合はエラーを返す', () => {
        const usecase = factory();
        const { findSpy, updateSpy } = getDependencies(usecase);
        findSpy.mockReturnValue([createValidPasswordReset()]);
        updateSpy.mockImplementation(() => {
            throw new Error('update failed');
        });

        expect(() => usecase.execute('validToken', 'newPassword')).toThrow(
            Error
        );
    });
});
