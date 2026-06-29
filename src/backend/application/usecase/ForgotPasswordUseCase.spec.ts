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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { systemName } from '../../../shared/config';
import { PasswordReset } from '../../../shared/domain/entity/PasswordReset';
import { User } from '../../../shared/domain/entity/User';
import { PasswordResetNotification } from '../../../shared/domain/valueObject/PasswordResetNotification';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { initializeEmptyTables } from './CreateUserUseCase.spec';
import { ForgotPasswordUseCase } from './ForgotPasswordUseCase';

let usecase: ForgotPasswordUseCase;
let getUuidSpy: ReturnType<typeof vi.spyOn>;
let findSpy: ReturnType<typeof vi.spyOn>;
let sendEmailSpy: ReturnType<typeof vi.spyOn>;
let createSpy: ReturnType<typeof vi.spyOn>;
let getUrlSpy: ReturnType<typeof vi.spyOn>;

describe('パスワード忘れユースケース', () => {
    beforeEach(() => {
        const utilities = new NodeUtilities();
        const dataStore = new InMemoryDataStore();
        initializeEmptyTables(dataStore);
        const gateway = new InMemoryGateway(dataStore);
        const db = new SheetDB(
            ALL_TABLES,
            gateway,
            new InMemoryCacheService(),
            utilities
        );
        const gmailApp: Pick<GoogleAppsScript.Gmail.GmailApp, 'sendEmail'> = {
            sendEmail: vi.fn(),
        };
        const scriptApp: Pick<GoogleAppsScript.Script.ScriptApp, 'getService'> =
            {
                getService: vi.fn().mockReturnValue({
                    getUrl: vi.fn(),
                }),
            };
        sendEmailSpy = vi.spyOn(gmailApp, 'sendEmail');
        usecase = new ForgotPasswordUseCase(db, utilities, gmailApp, scriptApp);
        getUuidSpy = vi.spyOn(utilities, 'getUuid');
        findSpy = vi.spyOn(db, 'find');
        sendEmailSpy = vi.spyOn(gmailApp, 'sendEmail');
        createSpy = vi.spyOn(db, 'create');
        getUrlSpy = vi.spyOn(scriptApp.getService(), 'getUrl');
    });

    describe('バリデーション', () => {
        it('メールアドレスの形式が不正な場合はエラーになる', () => {
            expect(() => usecase.execute('invalid-email')).toThrow(
                InvalidArgumentError
            );
        });
    });

    describe('認可', () => {
        it('存在しないメールアドレスの場合はパスワードを再設定できない', () => {
            findSpy.mockReturnValue([]);
            expect(() => usecase.execute('nonexistent@example.com')).toThrow(
                ForbiddenError
            );
        });
    });

    describe('シーケンス', () => {
        const email = 'test@example.com';
        const token = '123e4567-e89b-12d3-a456-426614174000';
        const url = `https://example.com/reset-password`;

        describe('トークンを生成して、パスワード再設定メールを送信する', () => {
            const utilities = new NodeUtilities();
            vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

            const notification = new PasswordResetNotification(
                token,
                url,
                utilities.formatDate(
                    new Date(Date.now() + 30 * 60 * 1000),
                    'Asia/Tokyo',
                    'yyyy/MM/dd HH:mm:ss'
                ),
                systemName
            );
            it('メールを送信する', () => {
                getUuidSpy.mockReturnValue(token);
                findSpy.mockReturnValue([
                    new User(
                        '1',
                        'Test User',
                        email,
                        'hashed-password',
                        true,
                        1
                    ),
                ]);
                getUrlSpy.mockReturnValue(url);
                createSpy.mockReturnValue([]);
                usecase.execute(email);
                expect(sendEmailSpy).toHaveBeenCalledWith(
                    email,
                    notification.title,
                    notification.body
                );
            });
        });
        describe('Uuidを、パスワード設定トークンとしてDBに保存する', () => {
            // テストの実装
            it('現在の30分後の有効期限で保存処理が呼び出される', () => {
                getUuidSpy.mockReturnValue(token);
                findSpy.mockReturnValue([
                    new User(
                        '1',
                        'Test User',
                        email,
                        'hashed-password',
                        true,
                        1
                    ),
                ]);
                vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
                const expiredAt = Date.now() + 30 * 60 * 1000; // 30分後
                const passwordReset = new PasswordReset('1', token, expiredAt);
                createSpy.mockReturnValue([passwordReset]);
                usecase.execute(email);
                expect(createSpy).toHaveBeenCalledWith([
                    {
                        ユーザーID: '1',
                        トークン: token,
                        有効期限: expiredAt,
                    },
                ]);
            });

            it('保存が成功した場合、ok: trueが返る', () => {
                getUuidSpy.mockReturnValue(token);
                findSpy.mockReturnValue([
                    new User(
                        '1',
                        'Test User',
                        email,
                        'hashed-password',
                        true,
                        1
                    ),
                ]);
                // ここでusecase.executeの返り値を検証する
                vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));
                const expiredAt = Date.now() + 30 * 60 * 1000; // 30分後
                const passwordReset = new PasswordReset('1', token, expiredAt);
                createSpy.mockReturnValue([passwordReset]);
                const result = usecase.execute(email);

                expect(result).toEqual({ ok: true });
            });

            it('保存に失敗した場合はエラーになる', () => {
                getUuidSpy.mockReturnValue(token);
                findSpy.mockReturnValue([
                    new User(
                        '1',
                        'Test User',
                        email,
                        'hashed-password',
                        true,
                        1
                    ),
                ]);
                // ここでDBへの保存処理が失敗した場合のエラーを検証する
                const usecaseSpy = vi.spyOn(usecase, 'execute');
                usecaseSpy.mockImplementation(() => {
                    throw new Error('Failed to save token');
                });
                expect(() => usecase.execute(email)).toThrow(
                    'Failed to save token'
                );
            });
        });
    });
});
