import {
    InMemoryDataStore,
    InMemoryGateway,
    InvalidArgumentError,
    SheetDB,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { ApproveUserUseCase } from './ApproveUserUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const sheetDB = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    return new ApproveUserUseCase(sheetDB);
}

function getDependencies(approveUserUseCase: ApproveUserUseCase) {
    const findSpy = vi.spyOn(approveUserUseCase['db'], 'find');
    const updateSpy = vi.spyOn(approveUserUseCase['db'], 'update');
    return { findSpy, updateSpy };
}

describe('バリデーション', () => {
    it('実行者のユーザーIDがない場合はエラーになる', () => {
        const approveUserUseCase = factory();
        expect(() =>
            approveUserUseCase.execute(
                undefined as unknown as string,
                {} as unknown as any
            )
        ).toThrow(InvalidArgumentError);
    });

    it('承認するユーザーがいない場合はエラーになる', () => {
        const approveUserUseCase = factory();
        const executorUserId = '123e4567-e89b-42d3-a456-426614174000';
        expect(() =>
            approveUserUseCase.execute(
                executorUserId,
                undefined as unknown as any
            )
        ).toThrow(InvalidArgumentError);
    });
});

describe('認可', () => {
    it('管理者権限がない場合、ユーザーを承認できない', () => {
        const approveUserUseCase = factory();
        const { findSpy } = getDependencies(approveUserUseCase);
        findSpy.mockReturnValueOnce([]);
        const executorUserId = '123e4567-e89b-42d3-a456-426614174000';
        const approvedUserParams = {
            ID: '123e4567-e89b-42d3-a456-426614174001',
            氏名: 'Pending User',
            メールアドレス: 'pending@example.com',
            パスワード: 'password',
            承認: false,
            バージョン: 1,
        };

        expect(() =>
            approveUserUseCase.execute(executorUserId, approvedUserParams)
        ).toThrow(UnauthorizedError);
    });
});

describe('シーケンス', () => {
    const executorUserId = '123e4567-e89b-42d3-a456-426614174000';
    const approvedUserParams = {
        ID: '123e4567-e89b-42d3-a456-426614174001',
        氏名: 'Pending User',
        メールアドレス: 'pending@example.com',
        パスワード: 'password',
        承認: false,
        バージョン: 1,
    };

    let approveUserUseCase: ApproveUserUseCase;
    let dataStore: InMemoryDataStore;
    let findSpy: ReturnType<typeof vi.spyOn>;
    let updateSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        approveUserUseCase = factory();
        dataStore = approveUserUseCase['db']['gateway']['dataStore'];
        dataStore.set(':ユーザー', [
            [
                'ID',
                '氏名',
                'メールアドレス',
                'パスワード',
                '承認',
                'バージョン',
            ],
            [
                '123e4567-e89b-42d3-a456-426614174000',
                'Admin User',
                'admin@example.com',
                'password',
                true,
                1,
            ],
            [
                '123e4567-e89b-42d3-a456-426614174001',
                'Pending User',
                'pending@example.com',
                'password',
                false,
                1,
            ],
        ]);
        dataStore.set(':ロール', [
            ['ユーザーID', '名称'],
            ['123e4567-e89b-42d3-a456-426614174000', '管理者'],
            ['123e4567-e89b-42d3-a456-426614174001', 'ユーザー'],
        ]);
        ({ findSpy, updateSpy } = getDependencies(approveUserUseCase));
    });

    it('承認したユーザーをDBに保存する', () => {
        const admin = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Admin User',
            'admin@example.com',
            'password',
            true,
            1
        );
        admin.addRelation(Role, new Role(admin.id, 'システム管理者'));

        const pendingUser = new User(
            '123e4567-e89b-42d3-a456-426614174001',
            'Pending User',
            'pending@example.com',
            'password',
            false,
            1
        );

        findSpy.mockReturnValue([admin, pendingUser]);
        approveUserUseCase.execute(executorUserId, approvedUserParams);

        pendingUser.approve();
        expect(updateSpy).toHaveBeenCalledWith([pendingUser]);
    });

    it('承認されたユーザーがDBに追加される', () => {
        const admin = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Admin User',
            'admin@example.com',
            'password',
            true,
            1
        );
        admin.addRelation(Role, new Role(admin.id, 'システム管理者'));

        const pendingUser = new User(
            '123e4567-e89b-42d3-a456-426614174001',
            'Pending User',
            'pending@example.com',
            'password',
            false,
            1
        );
        pendingUser.addRelation(Role, new Role(pendingUser.id, 'ユーザー'));

        findSpy.mockReturnValue([admin, pendingUser]);

        approveUserUseCase.execute(executorUserId, approvedUserParams);

        expect(dataStore.dump()).toEqual([
            [
                'ID',
                '氏名',
                'メールアドレス',
                'パスワード',
                '承認',
                'バージョン',
            ],
            [
                '123e4567-e89b-42d3-a456-426614174000',
                'Admin User',
                'admin@example.com',
                'password',
                true,
                1,
            ],
            [
                '123e4567-e89b-42d3-a456-426614174001',
                'Pending User',
                'pending@example.com',
                'password',
                true,
                2,
            ],
            ['ユーザーID', '名称'],
            ['123e4567-e89b-42d3-a456-426614174000', '管理者'],
            ['123e4567-e89b-42d3-a456-426614174001', 'ユーザー'],
        ]);
    });

    it('正常に承認された場合、更新されたユーザーを返す', () => {
        const admin = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Admin User',
            'admin@example.com',
            'password',
            true,
            1
        );
        admin.addRelation(Role, new Role(admin.id, 'システム管理者'));

        const pendingUser = new User(
            '123e4567-e89b-42d3-a456-426614174001',
            'Pending User',
            'pending@example.com',
            'password',
            false,
            1
        );
        pendingUser.addRelation(Role, new Role(pendingUser.id, 'ユーザー'));

        findSpy.mockReturnValue([admin, pendingUser]);

        const result = approveUserUseCase.execute(
            executorUserId,
            approvedUserParams
        );

        expect(result).toEqual({
            user: {
                ID: pendingUser.id,
                氏名: pendingUser.name,
                メールアドレス: pendingUser.email,
                パスワード: '',
                承認: true,
                バージョン: pendingUser.version + 1,
            },
        });
    });

    it('ユーザーのバージョンがすでに更新されている場合はエラーになる', () => {
        const admin = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Admin User',
            'admin@example.com',
            'password',
            true,
            1
        );
        admin.addRelation(Role, new Role(admin.id, 'システム管理者'));

        const pendingUser = new User(
            '123e4567-e89b-42d3-a456-426614174001',
            'Pending User',
            'pending@example.com',
            'password',
            false,
            2
        );
        pendingUser.addRelation(Role, new Role(pendingUser.id, 'ユーザー'));

        findSpy.mockReturnValue([admin, pendingUser]);
        dataStore.set(':ユーザー', [
            [
                'ID',
                '氏名',
                'メールアドレス',
                'パスワード',
                '承認',
                'バージョン',
            ],
            [
                '123e4567-e89b-42d3-a456-426614174000',
                'Admin User',
                'admin@example.com',
                'password',
                true,
                1,
            ],
            [
                '123e4567-e89b-42d3-a456-426614174001',
                'Pending User',
                'pending@example.com',
                'password',
                false,
                2,
            ],
        ]);

        expect(() =>
            approveUserUseCase.execute(executorUserId, approvedUserParams)
        ).toThrow('Optimistic lock error: expected version 2 but got 1');
    });
});
