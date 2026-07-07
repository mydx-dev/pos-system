import {
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    InMemoryContext,
    InMemoryPropertiesService,
    InMemorySession,
    NodeUtilities,
    OAuthScope,
    SecurityPolicy,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';
import { SystemAdmins } from '../service/SystemAdmins';
import { CreateUserUseCase } from './CreateUserUseCase';

export function initializeEmptyTables(dataStore: InMemoryDataStore) {
    for (const table of ALL_TABLES) {
        dataStore.set(`:${table.name}`, [Object.keys(table.schema.shape)]);
    }
}

function factory() {
    const scriptProperties =
        new InMemoryPropertiesService().getScriptProperties();
    scriptProperties.setProperty(
        'PASSWORD_PEPPER',
        '780c4cdb-52cf-4b2f-9d35-c20166ed9df2'
    );

    const passwordProtection = new PasswordProtection(
        new NodeUtilities(),
        scriptProperties
    );

    const dataStore = new InMemoryDataStore();
    initializeEmptyTables(dataStore);
    const gateway = new InMemoryGateway(dataStore);

    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );

    const context = new InMemoryContext(
        'developer@example.com',
        'user@example.com',
        {
            type: 'WEB_APP',
            executeAs: 'USER',
        },
        new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
        'ja',
        'Asia/Tokyo'
    );
    const session = new InMemorySession(context);
    const admins = new SystemAdmins(db);
    const gmailApp = {
        sendEmail: vi.fn(),
    } satisfies Pick<GoogleAppsScript.Gmail.GmailApp, 'sendEmail'>;

    const scriptApp = {
        getService: vi.fn(),
    } satisfies Pick<GoogleAppsScript.Script.ScriptApp, 'getService'>;

    scriptApp.getService.mockReturnValue({
        getUrl: vi.fn,
    });

    return new CreateUserUseCase(
        new NodeUtilities(),
        passwordProtection,
        db,
        admins,
        session,
        gmailApp,
        scriptApp
    );
}

function getDependencies(createUserUseCase: CreateUserUseCase) {
    const getUuid = vi.spyOn(createUserUseCase['utilities'], 'getUuid');
    const passwordProtection = vi.spyOn(
        createUserUseCase['passwordProtection'],
        'execute'
    );
    const create = vi.spyOn(createUserUseCase['db'], 'create');
    const findSpy = vi.spyOn(createUserUseCase['db'], 'find');
    const systemAdminsSearchSpy = vi.spyOn(
        createUserUseCase['systemAdmins'],
        'search'
    );
    const getEmailSpy = vi.spyOn(
        createUserUseCase['session'].getEffectiveUser(),
        'getEmail'
    );

    const sendEmailSpy = vi.spyOn(createUserUseCase['gmailApp'], 'sendEmail');
    const getServiceUrlSpy = vi.spyOn(
        createUserUseCase['scriptApp'].getService(),
        'getUrl'
    );

    return {
        getUuid,
        passwordProtection,
        create,
        findSpy,
        systemAdminsSearchSpy,
        getEmailSpy,
        sendEmailSpy,
        getServiceUrlSpy,
    };
}

describe('CreateUserUseCase', () => {
    it('ユーザーのメールアドレスが不正な形式の場合、ユーザーを作成できない', () => {
        const createUserUseCase = factory();
        expect(() =>
            createUserUseCase.execute({
                name: 'Test User',
                email: 'invalid-email',
                password: 'Password123!',
            })
        ).toThrow('Invalid email format');
    });

    it('ユーザーのパスワードが８文字以上、英語大文字小文字１文字以上、数字一文字以上でない場合、ユーザーを作成できない', () => {
        const createUserUseCase = factory();
        expect(() =>
            createUserUseCase.execute({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
            })
        ).toThrow(
            'Password must be a combination of uppercase letters, lowercase letters, numbers, and special characters'
        );
    });

    it('生成したユーザーIDを使って、パスワードを保護する', () => {
        const createUserUseCase = factory();
        const { getUuid, passwordProtection, create, findSpy } =
            getDependencies(createUserUseCase);
        create.mockReturnValue([]);
        findSpy.mockReturnValue([]);

        expect(() => {
            createUserUseCase.execute({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!',
            });
        }).toThrow();

        const uuid = getUuid.mock.results[0].value;
        expect(passwordProtection).toHaveBeenCalledWith('Password123!', uuid);
    });

    describe('既存のシステム管理者', () => {
        describe('0名', () => {
            describe('新規作成ユーザーのメールアドレスがスクリプトオーナーと', () => {
                const createUserUseCase = factory();
                const {
                    getUuid,
                    passwordProtection,
                    findSpy,
                    create,
                    systemAdminsSearchSpy,
                    getEmailSpy,
                } = getDependencies(createUserUseCase);
                const uuid = '780c4cdb-52cf-4b2f-9d35-c20166ed9df2';
                const name = 'Owner User';
                const hashedPassword = 'hashed-password';
                getUuid.mockReturnValue(uuid);
                passwordProtection.mockReturnValue(hashedPassword);
                findSpy.mockReturnValue([]);
                systemAdminsSearchSpy.mockReturnValue([]);
                const developerEmail = 'developer@example.com';
                getEmailSpy.mockReturnValue(developerEmail);

                it('一致する場合、強制的に承認して、管理者権限を付与してDBに保存する', () => {
                    createUserUseCase.execute({
                        name: name,
                        email: developerEmail,
                        password: 'Password123!',
                    });

                    expect(create).toHaveBeenCalledWith([
                        {
                            ID: uuid,
                            氏名: name,
                            メールアドレス: developerEmail,
                            パスワード: hashedPassword,
                            承認: true,
                            バージョン: 1,
                            relations: {
                                ロール: [
                                    {
                                        ユーザーID: uuid,
                                        名称: 'システム管理者',
                                    },
                                ],
                            },
                        },
                    ]);
                });

                it('一致しない場合、新規ユーザー作成を拒否する', () => {
                    const userEmail = 'user@example.com';

                    expect(() => {
                        createUserUseCase.execute({
                            name: name,
                            email: userEmail,
                            password: 'Password123!',
                        });
                    }).toThrow('Not allowd to create user');
                });
            });
        });

        describe('1名以上存在する場合', () => {
            it('新規ユーザーを未承認状態でユーザー権限で保存する', () => {
                const createUserUseCase = factory();
                const {
                    create,
                    systemAdminsSearchSpy,
                    getUuid,
                    passwordProtection,
                } = getDependencies(createUserUseCase);
                const uuid = '780c4cdb-52cf-4b2f-9d35-c20166ed9df2';
                getUuid.mockReturnValue(uuid);
                const hashedPassword = 'hashed-password';
                passwordProtection.mockReturnValue(hashedPassword);

                systemAdminsSearchSpy.mockReturnValue([
                    new User(
                        '1',
                        'Admin User',
                        'admin@example.com',
                        'hashed-password',
                        true,
                        1
                    ),
                ]);

                const name = 'Test User';
                const email = 'test-user@example.com';

                createUserUseCase.execute({
                    name,
                    email,
                    password: 'Password123!',
                });

                expect(create).toHaveBeenCalledWith([
                    {
                        ID: uuid,
                        氏名: name,
                        メールアドレス: email,
                        パスワード: hashedPassword,
                        承認: false,
                        バージョン: 1,
                        relations: {
                            ロール: [
                                {
                                    ユーザーID: uuid,
                                    名称: 'ユーザー',
                                },
                            ],
                        },
                    },
                ]);
            });

            const usecase = factory();
            const {
                sendEmailSpy,
                systemAdminsSearchSpy,
                getServiceUrlSpy,
                getUuid,
            } = getDependencies(usecase);
            const uuid = '780c4cdb-52cf-4b2f-9d35-c20166ed9df2';
            getUuid.mockReturnValue(uuid);
            systemAdminsSearchSpy.mockReturnValue([
                new User(
                    '1',
                    'Admin User',
                    'admin@example.com',
                    'hashed-password',
                    true,
                    1
                ),

                new User(
                    '2',
                    'Another Admin',
                    'another-admin@example.com',
                    'hashed-password',
                    true,
                    1
                ),
            ]);

            const url = `https://script.google.com/macros/s/AKfycbx1234567890/exec`;
            getServiceUrlSpy.mockReturnValue(url);

            const name = 'Test User';
            const email = 'test-user@example.com';
            const password = 'Password123!';

            usecase.execute({ name, email, password });

            it('通知文章をテンプレートに従い、システム管理者に送信する', () => {
                expect(sendEmailSpy).toHaveBeenCalledWith(
                    'admin@example.com',
                    '新規ユーザーが作成されました',
                    `システム管理者各位

新規ユーザーがシステムに追加されました。

氏名: Test User
メールアドレス: test-user@example.com

こちらのURLから承認できます。
${url}#/users/${uuid}`,
                    { cc: 'another-admin@example.com' }
                );
            });

            it('管理者が３人以上いる場合、２人目以降の管理者にCCで送信する', () => {
                systemAdminsSearchSpy.mockReturnValue([
                    new User(
                        '1',
                        'Admin User',
                        'admin@example.com',
                        'hashed-password',
                        true,
                        1
                    ),

                    new User(
                        '2',
                        'Another Admin',
                        'another-admin@example.com',
                        'hashed-password',
                        true,
                        1
                    ),

                    new User(
                        '3',
                        'Third Admin',
                        'third-admin@example.com',
                        'hashed-password',
                        true,
                        1
                    ),
                ]);

                const url = `https://script.google.com/macros/s/AKfycbx1234567890/exec`;
                getServiceUrlSpy.mockReturnValue(url);
                const anotherUuid = '123e4567-e89b-42d3-a456-426614174000';
                getUuid.mockReturnValue(anotherUuid);

                const name = 'Test User';
                const email = 'test-user2@example.com';
                const password = 'Password123!';

                usecase.execute({ name, email, password });

                expect(sendEmailSpy).toHaveBeenCalledWith(
                    'admin@example.com',
                    '新規ユーザーが作成されました',
                    `システム管理者各位

新規ユーザーがシステムに追加されました。

氏名: Test User
メールアドレス: test-user2@example.com

こちらのURLから承認できます。
${url}#/users/${anotherUuid}`,
                    { cc: 'another-admin@example.com,third-admin@example.com' }
                );
            });
        });
    });
    it.todo('ユーザー作成処理が失敗した場合、ロールバックする');
});
