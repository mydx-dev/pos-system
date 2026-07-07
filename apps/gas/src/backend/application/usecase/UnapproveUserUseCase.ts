import {
    ForbiddenError,
    InvalidArgumentError,
    NotFoundError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { UnapproveUserInput } from '../../../shared/api/user';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class UnapproveUserUseCase {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}
    execute(executorId: string, user: UnapproveUserInput['user']) {
        if (typeof executorId !== 'string') {
            throw new InvalidArgumentError('Invalid executor ID');
        }

        const users = this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('ID', '=', [executorId, user.ID])
                    .join('ID', 'ロール', 'ユーザーID')
            );

        const executor = users.find((u) => u.id === executorId);
        if (!executor) {
            throw new ForbiddenError('Executor not found');
        }

        if (!executor.approval) {
            throw new ForbiddenError('Executor is not approved');
        }

        const targetUser = users.find((u) => u.id === user.ID);
        if (!targetUser) {
            throw new NotFoundError('Target user not found');
        }

        const unapprovedUser = new User(
            targetUser.id,
            targetUser.name,
            targetUser.email,
            targetUser.password,
            targetUser.approval,
            user.バージョン
        );

        unapprovedUser.unapprove();
        const savedUser = this.db.table('ユーザー').update([unapprovedUser])[0];

        if (!savedUser) {
            throw new Error('DB update failed');
        }

        return {
            ID: savedUser.id,
            氏名: savedUser.name,
            メールアドレス: savedUser.email,
            パスワード: '',
            承認: savedUser.approval,
            バージョン: savedUser.version,
        };
    }
}
