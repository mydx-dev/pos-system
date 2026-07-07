import {
    ForbiddenError,
    InvalidArgumentError,
    NotFoundError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';

export class ResetPasswordUseCase {
    constructor(
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly passwordProtection: PasswordProtection
    ) {}
    execute(token: string, newPassword: string) {
        if (!token) {
            throw new InvalidArgumentError('Token is required');
        }

        if (!newPassword) {
            throw new InvalidArgumentError('New password is required');
        }

        const passwordReset = this.db
            .table('パスワードリセット')
            .find(
                this.db
                    .query('パスワードリセット')
                    .and('トークン', '=', [token])
            )[0];

        if (!passwordReset) {
            throw new ForbiddenError('Invalid token');
        }

        if (!passwordReset.isValid(Date.now())) {
            throw new ForbiddenError('Token has expired');
        }

        const user = this.db
            .table('ユーザー')
            .find(
                this.db.query('ユーザー').and('ID', '=', [passwordReset.userId])
            )[0];

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const hashedPassword = this.passwordProtection.execute(
            newPassword,
            user.id
        );

        user.resetPassword(hashedPassword);
        const result = this.db.table('ユーザー').update([user]);
        if (!result) {
            throw new Error('Failed to update user password');
        }
        return { ok: true };
    }
}
