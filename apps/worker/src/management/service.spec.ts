import { describe, expect, it } from 'vitest';
import type { ManagementUser } from '../auth/managementSession';
import type { ManagementStore } from './service';
import { ManagementService } from './service';

const adminId = '00000000-0000-4000-8000-000000000001';
const userId = '00000000-0000-4000-8000-000000000002';

const adminSession: ManagementUser = {
    authUserId: adminId,
    posUserId: adminId,
    email: 'admin@example.com',
    name: 'Admin',
    role: 'システム管理者',
};

const userSession: ManagementUser = {
    authUserId: userId,
    posUserId: userId,
    email: 'user@example.com',
    name: 'User',
    role: 'ユーザー',
};

const createStore = (
    overrides: Partial<ManagementStore> = {}
): ManagementStore => {
    const records = new Map([
        [
            adminId,
            {
                id: adminId,
                name: 'Admin',
                email: 'admin@example.com',
                password: 'secret',
                approval: 1,
                version: 1,
                role: 'システム管理者' as const,
            },
        ],
        [
            userId,
            {
                id: userId,
                name: 'User',
                email: 'user@example.com',
                password: 'secret',
                approval: 0,
                version: 1,
                role: 'ユーザー' as const,
            },
        ],
    ]);

    return {
        countApprovedSystemAdmins: async () =>
            [...records.values()].filter(
                (record) =>
                    record.approval === 1 && record.role === 'システム管理者'
            ).length,
        findUserWithRoleById: async (id) => records.get(id) ?? null,
        updateApproval: async (id, version, approval) => {
            const record = records.get(id);
            if (!record || record.version !== version) {
                return false;
            }

            records.set(id, {
                ...record,
                approval: approval ? 1 : 0,
                version: record.version + 1,
            });
            return true;
        },
        updateUser: async (id, version, input) => {
            const record = records.get(id);
            if (!record || record.version !== version) {
                return false;
            }

            records.set(id, {
                ...record,
                name: input.name,
                email: input.email,
                version: record.version + 1,
            });
            return true;
        },
        deleteUser: async (id) => records.delete(id),
        ...overrides,
    };
};

const createService = (store = createStore()) =>
    new ManagementService({ DB: null } as unknown as Env, store);

describe('ManagementService', () => {
    it('allows system administrators to approve users with optimistic locking', async () => {
        const service = createService();

        await expect(
            service.approveUser(adminSession, {
                sessionToken: 'legacy-session-token',
                user: {
                    ID: userId,
                    バージョン: 1,
                },
            })
        ).resolves.toEqual({
            user: {
                ID: userId,
                氏名: 'User',
                メールアドレス: 'user@example.com',
                パスワード: '',
                承認: true,
                バージョン: 2,
            },
        });
    });

    it('rejects approval from non administrators', async () => {
        const service = createService();

        await expect(
            service.approveUser(userSession, {
                sessionToken: 'legacy-session-token',
                user: {
                    ID: userId,
                    バージョン: 1,
                },
            })
        ).rejects.toMatchObject({
            code: 'forbidden',
        });
    });

    it('returns conflict when the submitted user version is stale', async () => {
        const service = createService();

        await expect(
            service.updateUser(adminSession, {
                sessionToken: 'legacy-session-token',
                user: {
                    ID: userId,
                    氏名: 'Updated User',
                    メールアドレス: 'updated@example.com',
                    バージョン: 99,
                },
            })
        ).rejects.toMatchObject({
            code: 'conflict',
        });
    });

    it('allows approved users to update their own profile', async () => {
        const service = createService();

        await expect(
            service.updateUser(userSession, {
                sessionToken: 'legacy-session-token',
                user: {
                    ID: userId,
                    氏名: 'Updated User',
                    メールアドレス: 'updated@example.com',
                    バージョン: 1,
                },
            })
        ).resolves.toMatchObject({
            user: {
                ID: userId,
                氏名: 'Updated User',
                メールアドレス: 'updated@example.com',
                バージョン: 2,
            },
        });
    });

    it('protects the last approved system administrator from deletion', async () => {
        const service = createService();

        await expect(
            service.deleteUser(adminSession, {
                sessionToken: 'legacy-session-token',
                id: adminId,
            })
        ).rejects.toMatchObject({
            code: 'forbidden',
        });
    });
});
