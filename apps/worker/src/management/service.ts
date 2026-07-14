import type {
    ApproveUserInput,
    DeleteUserInput,
    UnapproveUserInput,
    UpdateUserInput,
} from '@mydx-pos/shared/api/user';
import {
    ManagementRepository,
    type ManagementUserRecord,
} from '../db/managementRepository';
import type { ManagementUser } from '../auth/managementSession';
import { AuthApiError } from '../auth/service';

type UserResponse = {
    ID: string;
    氏名: string;
    メールアドレス: string;
    パスワード: string;
    承認: boolean;
    バージョン: number;
};

export type ManagementStore = Pick<
    ManagementRepository,
    'deleteUser' | 'findUserWithRoleById' | 'updateApproval' | 'updateUser'
>;

const serializeUser = (user: ManagementUserRecord): UserResponse => ({
    ID: user.id,
    氏名: user.name,
    メールアドレス: user.email,
    パスワード: '',
    承認: user.approval === 1,
    バージョン: user.version,
});

const requireSystemAdmin = (executor: ManagementUser) => {
    if (executor.role !== 'システム管理者') {
        throw new AuthApiError(
            'forbidden',
            'System administrator role is required.'
        );
    }
};

export class ManagementService {
    private readonly repository: ManagementStore;

    constructor(env: Env, repository?: ManagementStore) {
        this.repository = repository ?? new ManagementRepository(env.DB);
    }

    async approveUser(executor: ManagementUser, input: ApproveUserInput) {
        requireSystemAdmin(executor);

        const target = await this.requireTarget(input.user.ID);
        await this.updateApprovalOrThrow(target, input.user.バージョン, true);

        return {
            user: serializeUser(await this.requireTarget(input.user.ID)),
        };
    }

    async unapproveUser(executor: ManagementUser, input: UnapproveUserInput) {
        requireSystemAdmin(executor);

        const target = await this.requireTarget(input.user.ID);

        const updated = await this.repository.updateApproval(
            target.id,
            input.user.バージョン,
            false
        );

        if (!updated) {
            const current = await this.requireTarget(target.id);
            if (
                current.version === input.user.バージョン &&
                current.id === executor.posUserId &&
                current.role === 'システム管理者' &&
                current.approval === 1
            ) {
                throw new AuthApiError(
                    'forbidden',
                    'The last approved system administrator cannot be unapproved.'
                );
            }

            throw new AuthApiError(
                'conflict',
                'User has been modified by another request.'
            );
        }

        return {
            user: serializeUser(await this.requireTarget(input.user.ID)),
        };
    }

    async updateUser(executor: ManagementUser, input: UpdateUserInput) {
        const target = await this.requireTarget(input.user.ID);

        if (
            executor.role !== 'システム管理者' &&
            executor.posUserId !== target.id
        ) {
            throw new AuthApiError(
                'forbidden',
                'Only system administrators can update other users.'
            );
        }

        const updated = await this.repository
            .updateUser(target.id, input.user.バージョン, {
                name: input.user.氏名,
                email: input.user.メールアドレス,
            })
            .catch((caught) => {
                if (
                    caught instanceof Error &&
                    caught.message.includes('UNIQUE')
                ) {
                    throw new AuthApiError('conflict', 'User already exists.');
                }
                throw caught;
            });

        if (!updated) {
            throw new AuthApiError(
                'conflict',
                'User has been modified by another request.'
            );
        }

        return {
            user: serializeUser(await this.requireTarget(target.id)),
        };
    }

    async deleteUser(executor: ManagementUser, input: DeleteUserInput) {
        requireSystemAdmin(executor);

        const target = await this.requireTarget(input.id);

        const deleted = await this.repository.deleteUser(target.id);
        if (!deleted) {
            const current = await this.repository.findUserWithRoleById(
                target.id
            );
            if (
                current &&
                current.id === executor.posUserId &&
                current.role === 'システム管理者' &&
                current.approval === 1
            ) {
                throw new AuthApiError(
                    'forbidden',
                    'The last approved system administrator cannot be deleted.'
                );
            }

            throw new AuthApiError(
                'conflict',
                'User has been modified by another request.'
            );
        }

        return { ok: true };
    }

    private async requireTarget(id: string) {
        const user = await this.repository.findUserWithRoleById(id);
        if (!user) {
            throw new AuthApiError('not_found', 'Target user not found.');
        }
        return user;
    }

    private async updateApprovalOrThrow(
        target: ManagementUserRecord,
        version: number,
        approval: boolean
    ) {
        const updated = await this.repository.updateApproval(
            target.id,
            version,
            approval
        );

        if (!updated) {
            throw new AuthApiError(
                'conflict',
                'User has been modified by another request.'
            );
        }
    }
}
