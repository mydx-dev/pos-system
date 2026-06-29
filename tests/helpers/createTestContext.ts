import { vi } from 'vitest';
import { testContainer } from '../../src/backend/di.mock';

export const uuidv4 = '123e4567-e89b-42d3-a456-426614174000';

export function createTestContext() {
    const scope = testContainer.createScope();
    const db = scope.resolve('db');
    const permissionCheck = scope.resolve('permissionCheck');

    return {
        scope,
        cradle: scope.cradle,

        db,
        permissionCheck,
        dataStore: scope.resolve('dataStore'),

        dbSpy: {
            findSpy: vi.spyOn(db, 'find'),
            createSpy: vi.spyOn(db, 'create'),
            deleteSpy: vi.spyOn(db, 'delete'),
            updateSpy: vi.spyOn(db, 'update'),
            upsertSpy: vi.spyOn(db, 'upsert'),
        },
        authSpy: vi.spyOn(scope.resolve('authentication'), 'execute'),
        permissionCheckSpy: {
            isApprovedDeveloperSpy: vi.spyOn(
                permissionCheck,
                'isApprovedDeveloper'
            ),
            isApprovedDeveloperOrSystemAdminSpy: vi.spyOn(
                permissionCheck,
                'isApprovedDeveloperOrSystemAdmin'
            ),
        },
        getUuidSpy: vi.spyOn(scope.resolve('utilities'), 'getUuid'),
        properties: scope.resolve('properties'),
    };
}
