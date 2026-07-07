import {
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    InMemoryPropertiesService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';
import { LoginUserUseCase } from './LoginUserUseCase';

function factory() {
    const scriptProperties =
        new InMemoryPropertiesService().getScriptProperties();
    const passwordProtection = new PasswordProtection(
        new NodeUtilities(),
        scriptProperties
    );
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    const cache = new InMemoryCacheService().getScriptCache();
    const usecase = new LoginUserUseCase(
        passwordProtection,
        new NodeUtilities(),
        db,
        cache
    );
    return { usecase };
}

function getDependencies(usecase: LoginUserUseCase) {
    const passwordProtectionSpy = vi.spyOn(
        usecase['passwordProtection'],
        'execute'
    );

    const getUuidSpy = vi.spyOn(usecase['utilities'], 'getUuid');
    const cachePutSpy = vi.spyOn(usecase['cache'], 'put');
    const findSpy = vi.spyOn(usecase['db'].table('ユーザー'), 'find');
    return { passwordProtectionSpy, getUuidSpy, cachePutSpy, findSpy };
}

describe('ログインユースケース', () => {
    describe('バリデーション', () => {
        it('メールアドレスが不正な形式の場合、エラーになる', () => {
            const { usecase } = factory();
            expect(() =>
                usecase.execute({
                    email: 'invalid-email',
                    password: 'Password123!',
                })
            ).toThrow('Invalid email format');
        });
        it('パスワードが不正な形式の場合、エラーになる', () => {
            const { usecase } = factory();
            expect(() =>
                usecase.execute({
                    email: 'user@example.com',
                    password: 'invalid-password',
                })
            ).toThrow('Invalid password format');
        });
    });

    describe('認証', () => {
        describe('承認済み且つメールアドレスと一致するユーザー', () => {
            const { usecase } = factory();
            const { passwordProtectionSpy, getUuidSpy, cachePutSpy, findSpy } =
                getDependencies(usecase);
            const dataStore = usecase['db']['gateway']['dataStore'];
            dataStore.set(':ユーザー', [
                ['ID', '氏名', 'メールアドレス', 'パスワード'],
                ['1', 'Test User', 'user@example.com', 'protected-password'],
            ]);

            const email = 'user@example.com';
            const password = 'Password123';
            passwordProtectionSpy.mockReturnValue('protected-password');

            describe('存在する場合', () => {
                findSpy.mockReturnValue([
                    new User(
                        '1',
                        'Test User',
                        'user@example.com',
                        'protected-password',
                        true,
                        1
                    ),
                ]);
                it('パスワードの保護を実行する', () => {
                    try {
                        usecase.execute({ email, password });
                    } catch {
                        // ignore
                    }
                    expect(passwordProtectionSpy).toHaveBeenCalledWith(
                        'Password123',
                        '1'
                    );
                });

                describe('保護されたパスワードとユーザーのパスワードが一致する場合', () => {
                    const sessionToken = 'valid-session-token';
                    getUuidSpy.mockReturnValue(sessionToken);
                    usecase.execute({ email, password });
                    it('セッショントークンが発行される', () => {
                        expect(getUuidSpy).toHaveBeenCalled();
                    });

                    it('セッショントークンとユーザーIDが20分間キャッシュに保存される', () => {
                        expect(cachePutSpy).toHaveBeenCalledWith(
                            sessionToken,
                            '1',
                            20 * 60
                        );
                    });
                });

                describe('保護されたパスワードとユーザーのパスワードが一致しない場合', () => {
                    passwordProtectionSpy.mockReturnValue(
                        'different-protected-password'
                    );
                    it('エラーになる', () => {
                        expect(() =>
                            usecase.execute({ email, password })
                        ).toThrow('Invalid password');
                    });
                });
            });
            it('存在しない場合、エラーになる', () => {
                findSpy.mockReturnValue([]);
                expect(() =>
                    usecase.execute({
                        email: 'nonexistent@example.com',
                        password: 'Password123',
                    })
                ).toThrow('User not found');
            });
        });
    });

    describe('戻り値', () => {
        it('ログインに成功した場合、セッショントークンとユーザー情報を返す', () => {
            const { usecase } = factory();
            const { passwordProtectionSpy, getUuidSpy, findSpy } =
                getDependencies(usecase);
            const dataStore = usecase['db']['gateway']['dataStore'];
            dataStore.set(':ユーザー', [
                ['ID', '氏名', 'メールアドレス', 'パスワード'],
                ['1', 'Test User', 'user@example.com', 'protected-password'],
            ]);

            dataStore.set(':ロール', [
                ['ID', 'ユーザーID', '権限'],
                ['1', '1', 'システム管理者'],
            ]);
            const email = 'user@example.com';
            const password = 'Password123';
            passwordProtectionSpy.mockReturnValue('protected-password');
            getUuidSpy.mockReturnValue('valid-session-token');
            const user = new User(
                '1',
                'Test User',
                'user@example.com',
                'protected-password',
                true,
                1
            );
            user.addRelation(Role, new Role('1', 'システム管理者'));

            findSpy.mockReturnValue([user]);
            const result = usecase.execute({ email, password });
            expect(result).toEqual({
                user: {
                    id: '1',
                    name: 'Test User',
                    email: 'user@example.com',
                    role: ['システム管理者'],
                },
                sessionToken: 'valid-session-token',
            });
        });
    });
});
