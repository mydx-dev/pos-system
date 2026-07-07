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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isSetupCompletedKey, passwordPepperKey } from '../../../shared/config';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { SetupSystemUseCase } from './SetupSystemUseCase';

const envKeys = {
    isSetupCompletedKey,
    passwordPepperKey,
};

const ownerEmail = 'owner@example.com';
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
    const scriptProperties =
        new InMemoryPropertiesService().getScriptProperties();
    const userEmail = 'user@example.com';

    const context = new InMemoryContext(
        ownerEmail,
        userEmail,
        {
            type: 'WEB_APP',
            executeAs: 'OWNER',
        },
        new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
        'ja',
        'Asia/Tokyo'
    );
    const session = new InMemorySession(context);
    const logger = {
        log: loggerLogSpy,
    };

    return new SetupSystemUseCase(
        db,
        scriptProperties,
        utilities,
        session,
        logger,
        envKeys
    );
}

function getDependencies(usecase: SetupSystemUseCase) {
    const execute = vi.spyOn(usecase, 'execute');
    const findSpy = vi.spyOn(usecase['db'], 'find');
    const migrateSpy = vi.spyOn(usecase['db'], 'migrate');
    const protectSpy = vi.spyOn(usecase['db'], 'protect');
    const getPropertySpy = vi.spyOn(usecase['properties'], 'getProperty');
    const setPropertySpy = vi.spyOn(usecase['properties'], 'setProperty');
    const getUuidSpy = vi.spyOn(usecase['utilities'], 'getUuid');
    const seedSpy = vi.spyOn(usecase['db'], 'seed');

    return {
        execute,
        findSpy,
        migrateSpy,
        protectSpy,
        getPropertySpy,
        setPropertySpy,
        getUuidSpy,
        seedSpy,
    };
}

const pepperKey = 'PASSWORD_PEPPER';
const loggerLogSpy = vi.fn();

beforeEach(() => {
    loggerLogSpy.mockClear();
});

describe('認可', () => {
    it('初期化が完了している場合は、初期化を実行できない', () => {});
});

describe('シーケンス', () => {
    it('データベースのマイグレーションが正常に呼び出される', () => {
        const usecase = factory();
        const { migrateSpy } = getDependencies(usecase);
        usecase.execute();
        expect(migrateSpy).toHaveBeenCalled();
        expect(loggerLogSpy).toHaveBeenNthCalledWith(
            1,
            'データベースの初期化が完了しました'
        );
    });

    it('データベースの保護が正常に呼び出される', () => {
        const usecase = factory();
        const { protectSpy } = getDependencies(usecase);
        usecase.execute();
        expect(protectSpy).toHaveBeenCalled();
        expect(loggerLogSpy).toHaveBeenNthCalledWith(
            2,
            'データベースの保護が完了しました'
        );
    });

    it('ペッパーがすでに作成されている場合は、ペッパーの作成は呼び出さない', () => {
        const usecase = factory();
        const { getPropertySpy, setPropertySpy } = getDependencies(usecase);
        getPropertySpy.mockReturnValue('existingPepper');
        usecase.execute();
        expect(getPropertySpy).toHaveBeenCalledWith(pepperKey);
        expect(setPropertySpy).not.toHaveBeenCalledWith(
            pepperKey,
            expect.anything()
        );
    });

    it('ペッパーが作成されていない場合のみ、ペッパーの作成と保存が呼び出される', () => {
        const usecase = factory();
        const { getPropertySpy, setPropertySpy, getUuidSpy } =
            getDependencies(usecase);
        getPropertySpy.mockReturnValue(null);
        const newPepper = 'newPepper';
        getUuidSpy.mockReturnValue(newPepper);
        usecase.execute();

        expect(getPropertySpy).toHaveBeenCalledWith(pepperKey);
        expect(getUuidSpy).toHaveBeenCalled();
        expect(setPropertySpy).toHaveBeenCalledWith(pepperKey, newPepper);
    });

    describe('初期ユーザーの作成', () => {
        it('スクリプトオーナーを管理者権限でシードする。（名前とパスワードは空）', () => {
            const usecase = factory();
            const { getUuidSpy, seedSpy } = getDependencies(usecase);
            getUuidSpy.mockReturnValue('admin-user-id');

            const firstUserParams = {
                ID: 'admin-user-id',
                氏名: 'システム管理者',
                メールアドレス: ownerEmail,
                パスワード: '',
                承認: true,
                バージョン: 1,
            };

            const permissionParams = {
                ユーザーID: 'admin-user-id',
                名称: 'システム管理者',
            };

            usecase.execute();
            expect(seedSpy).toHaveBeenNthCalledWith(1, 'ユーザー', [
                firstUserParams,
            ]);
            expect(seedSpy).toHaveBeenNthCalledWith(2, 'ロール', [
                permissionParams,
            ]);
            expect(loggerLogSpy).toHaveBeenNthCalledWith(
                3,
                '初期ユーザーの作成が完了しました'
            );
        });

        it('失敗した場合エラーを返す', () => {
            const usecase = factory();
            const { seedSpy } = getDependencies(usecase);
            seedSpy.mockImplementation(() => {
                throw new Error('Seed failed');
            });
            expect(() => usecase.execute()).toThrow('Seed failed');
        });
    });

    describe('初期設定完了フラグをONにする', () => {
        it('ペッパーに既存値がある場合', () => {
            const usecase = factory();
            const { setPropertySpy, getPropertySpy } = getDependencies(usecase);
            getPropertySpy.mockReturnValue('existingPepper');
            usecase.execute();
            expect(setPropertySpy).toHaveBeenCalledWith(
                envKeys.isSetupCompletedKey,
                'true'
            );
        });

        it('ペッパーに値がない場合', () => {
            const usecase = factory();
            const { setPropertySpy, getPropertySpy } = getDependencies(usecase);
            getPropertySpy.mockReturnValue(null);
            usecase.execute();
            expect(setPropertySpy).toHaveBeenNthCalledWith(
                2,
                envKeys.isSetupCompletedKey,
                'true'
            );
        });
    });

    it('正常に完了したら、スクリプトオーナーのメールアドレスを返す', () => {
        const usecase = factory();
        const result = usecase.execute();
        expect(result).toEqual(ownerEmail);
    });
});
