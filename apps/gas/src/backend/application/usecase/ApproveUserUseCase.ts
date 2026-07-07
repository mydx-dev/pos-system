import {
    InvalidArgumentError,
    NotFoundError,
    SheetDB,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import { ApproveUserInput } from '../../../shared/api/user';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class ApproveUserUseCase {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}
    execute(
        executorUserId: string,
        approvedUserParams: ApproveUserInput['user']
    ) {
        if (!executorUserId) {
            throw new InvalidArgumentError(
                'EXECUTOR_USER_ID',
                'Executor user ID is required'
            );
        }

        if (!approvedUserParams) {
            throw new InvalidArgumentError(
                'APPROVED_USER',
                'Approved user data is required'
            );
        }

        const users = this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('ID', '=', [executorUserId, approvedUserParams.ID])
                    .join('ID', 'ロール', 'ユーザーID')
            );
        const executor = users.find((user) => user.id === executorUserId);
        if (!executor) {
            throw new UnauthorizedError('Executor user not found');
        }

        if (!executor.isAdmin()) {
            throw new UnauthorizedError('Only admin can approve users');
        }

        const targetUser = users.find(
            (user) => user.id === approvedUserParams.ID
        );
        if (!targetUser) {
            throw new NotFoundError('Approved user not found');
        }

        const approveUser = new User(
            approvedUserParams.ID,
            targetUser.name,
            targetUser.email,
            targetUser.password,
            targetUser.approval,
            approvedUserParams.バージョン
        );

        approveUser.approve();
        const savedUser = this.db.table('ユーザー').update([approveUser])[0];

        return {
            user: {
                ID: savedUser.id,
                氏名: savedUser.name,
                メールアドレス: savedUser.email,
                パスワード: '',
                承認: savedUser.approval,
                バージョン: savedUser.version,
            },
        };
    }
}
