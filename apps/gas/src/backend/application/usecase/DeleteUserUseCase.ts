import { ForbiddenError, SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class DeleteUserUseCase {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}
    execute(executorId: string, userIdToDelete: string) {
        if (!executorId) {
            throw new Error('Admin user ID is required');
        }
        if (!userIdToDelete) {
            throw new Error('User ID to delete is required');
        }

        const userTable = this.db.table('ユーザー');

        const admins = userTable.find(
            this.db
                .query('ユーザー')
                .and('承認', '=', [true])
                .join(
                    'ID',
                    'ロール',
                    'ユーザーID',
                    this.db.query('ロール').and('名称', '=', ['システム管理者'])
                )
        );

        const executor = admins.find((admin) => admin.id === executorId);

        if (!executor || !executor.isAdmin()) {
            throw new ForbiddenError('Only administrators can delete users');
        }

        if (executorId === userIdToDelete && admins.length === 1) {
            throw new ForbiddenError('Administrators cannot delete themselves');
        }

        const deleteResult = userTable.delete([userIdToDelete]);
        if (!deleteResult) {
            throw new Error('Failed to delete user');
        }
        return deleteResult;
    }
}
