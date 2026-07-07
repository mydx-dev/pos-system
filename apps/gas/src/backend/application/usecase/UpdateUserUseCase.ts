import {
    ForbiddenError,
    InvalidArgumentError,
    NotFoundError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { UpdateUserInput } from '../../../shared/api/user';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class UpdateUserUseCase {
    constructor(private readonly db: SheetDB<typeof ALL_TABLES>) {}
    execute(executorId: string, userParams: UpdateUserInput['user']) {
        if (!executorId) {
            throw new InvalidArgumentError('Executor user ID is required');
        }

        const users = this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('ID', '=', [executorId, userParams.ID])
                    .join('ID', 'ロール', 'ユーザーID')
            );

        const me = users.find((u) => u.id === executorId);
        if (!me) {
            throw new NotFoundError('Executor user not found');
        }

        if (!me.isAdmin() && executorId !== userParams.ID) {
            throw new ForbiddenError('Only admin can update other users');
        }

        const exsistUser = users.find((u) => u.id === userParams.ID);
        if (!exsistUser) {
            throw new NotFoundError('Target user not found');
        }

        const user = new User(
            userParams.ID,
            userParams.氏名,
            userParams.メールアドレス,
            exsistUser.password,
            exsistUser.approval,
            userParams.バージョン
        );

        const updatedUser = this.db.table('ユーザー').update([user])[0];
        if (!updatedUser) {
            throw new Error('Failed to update user');
        }

        return {
            ID: updatedUser.id,
            氏名: updatedUser.name,
            メールアドレス: updatedUser.email,
            パスワード: '',
            承認: updatedUser.approval,
            バージョン: updatedUser.version,
        };
    }
}
