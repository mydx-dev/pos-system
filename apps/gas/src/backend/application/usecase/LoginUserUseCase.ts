import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { UserEmail } from '../../../shared/domain/valueObject/UserEmail';
import { UserPassword } from '../../../shared/domain/valueObject/UserPassword';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';

export class LoginUserUseCase {
    constructor(
        private passwordProtection: PasswordProtection,
        private utilities: GoogleAppsScript.Utilities.Utilities,
        private db: SheetDB<typeof ALL_TABLES>,
        private cache: GoogleAppsScript.Cache.Cache
    ) {}

    execute({ email, password }: { email: string; password: string }) {
        const userEmail = new UserEmail(email);
        const userPassword = new UserPassword(password);

        const users = this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('メールアドレス', '=', [userEmail.value])
                    .and('承認', '=', [true])
                    .join('ID', 'ロール', 'ユーザーID')
            );
        if (users.length === 0) {
            throw new Error('User not found');
        }
        const user = users[0];

        const protectedPassword = this.passwordProtection.execute(
            userPassword.value,
            user.id
        );

        const isAuthenticated = user.verifyPassword(protectedPassword);
        if (!isAuthenticated) {
            throw new Error('Invalid password');
        }

        const sessionId = this.utilities.getUuid();
        this.cache.put(sessionId, user.id, 20 * 60);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            sessionToken: sessionId,
        };
    }
}
