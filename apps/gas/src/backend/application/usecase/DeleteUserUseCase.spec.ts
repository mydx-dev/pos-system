import {
    ForbiddenError,
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { zocker } from 'zocker';
import { context } from '../../../../tests/contexts/deleteUserTestContext';
import { Role } from '@mydx-pos/shared/domain/entity/Role';
import { User } from '@mydx-pos/shared/domain/entity/User';
import {
    ALL_TABLES,
    EmployeeTable,
    UserTable,
} from '../../infrastructure/database/tables';
import { DeleteUserUseCase } from './DeleteUserUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );
    const usecase = new DeleteUserUseCase(db);
    return { usecase };
}

function getDependencies(usecase: DeleteUserUseCase) {
    const deleteSpy = vi.spyOn(usecase['db'], 'delete');
    const findSpy = vi.spyOn(usecase['db'], 'find');
    return { deleteSpy, findSpy };
}

describe('バリデーション', () => {
    it('実行者のIDがなければエラーになる', () => {
        const { usecase } = factory();
        expect(() =>
            usecase.execute(
                undefined as unknown as string,
                '123e4567-e89b-42d3-a456-426614174000'
            )
        ).toThrow('Admin user ID is required');
    });
    it('削除するユーザーIDがなければエラーになる', () => {
        const { usecase } = factory();
        expect(() =>
            usecase.execute(
                '123e4567-e89b-42d3-a456-426614174000',
                undefined as unknown as string
            )
        ).toThrow('User ID to delete is required');
    });
});

describe('認可', () => {
    it('管理者でなければエラーになる', () => {
        const { usecase } = factory();
        const { findSpy } = getDependencies(usecase);
        const adminUser = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'admin@example.com',
            'ValidPass123',
            true,
            1
        );
        adminUser.addRelation(
            Role,
            new Role('123e4567-e89b-42d3-a456-426614174000', 'ユーザー')
        );
        findSpy.mockReturnValue([adminUser]);

        expect(() =>
            usecase.execute(
                '123e4567-e89b-42d3-a456-426614174000',
                '123e4567-e89b-42d3-a456-426614174001'
            )
        ).toThrow(ForbiddenError);
    });

    it('削除した結果、管理者がいなくなる場合は削除できない（実行者が管理者であり、削除対象でもある場合）', () => {
        const { usecase } = factory();
        const { findSpy } = getDependencies(usecase);
        const adminUser = new User(
            '123e4567-e89b-42d3-a456-426614174000',
            'Test User',
            'admin@example.com',
            'ValidPass123',
            true,
            1
        );
        adminUser.addRelation(
            Role,
            new Role('123e4567-e89b-42d3-a456-426614174000', 'システム管理者')
        );
        findSpy.mockReturnValue([adminUser]);

        expect(() =>
            usecase.execute(
                '123e4567-e89b-42d3-a456-426614174000',
                '123e4567-e89b-42d3-a456-426614174000'
            )
        ).toThrow(ForbiddenError);
    });
});

describe('シーケンス', () => {
    it('ユーザー削除を呼び出す', () => {
        console.log(
            UserTable.getRelationTree().map((r) => ({
                child: r.childTable.name,
                onDelete: r.onDelete,
            }))
        );
        const {
            deleteUser: { usecase },
            dbSpy: { deleteSpy, findSpy },
            dataStore,
        } = context();
        const adminUserRecord = zocker(UserTable.schema)
            .supply(UserTable.schema.shape.承認, true)
            .generate();
        const adminUser = UserTable.deserialize(adminUserRecord);

        const deleteUserRecord = zocker(UserTable.schema)
            .supply(UserTable.schema.shape.承認, true)
            .generate();
        const deleteUser = UserTable.deserialize(deleteUserRecord);

        dataStore.set(`${UserTable.dbId}:${UserTable.name}`, [
            Object.keys(UserTable.schema.def.shape),
            Object.values(deleteUserRecord),
        ]);

        dataStore.set(`${EmployeeTable.dbId}:${EmployeeTable.name}`, [
            Object.keys(EmployeeTable.schema.def.shape),
            [deleteUser.id],
        ]);

        console.log(dataStore['storage']);
        adminUser.addRelation(Role, new Role(adminUser.id, 'システム管理者'));
        findSpy.mockReturnValueOnce([adminUser]);

        usecase.execute(adminUser.id, deleteUser.id);

        expect(deleteSpy).toHaveBeenCalledWith([deleteUser.id]);

        const remainingUsers = dataStore.get(
            `${UserTable.dbId}:${UserTable.name}`
        ).rows;
        expect(remainingUsers).toEqual([]);
        const remainingEmployees = dataStore.get(
            `${EmployeeTable.dbId}:${EmployeeTable.name}`
        ).rows;
        expect(remainingEmployees).toEqual([]);
    });

    it('ユーザー削除に失敗した場合はエラーになる', () => {
        const { usecase } = factory();
        const { deleteSpy, findSpy } = getDependencies(usecase);
        const adminUserId = '123e4567-e89b-42d3-a456-426614174000';
        const adminUser = new User(
            adminUserId,
            'Test User',
            'admin@example.com',
            'ValidPass123',
            true,
            1
        );
        adminUser.addRelation(Role, new Role(adminUserId, 'システム管理者'));
        findSpy.mockReturnValueOnce([adminUser]);
        deleteSpy.mockImplementation(() => {
            throw new Error('Delete failed');
        });

        const deleteUserId = '123e4567-e89b-42d3-a456-426614174001';
        expect(() => usecase.execute(adminUserId, deleteUserId)).toThrow();
    });
});
