import { SheetDB, UnauthorizedError } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from './PasswordProtection';

export class RegisterTerminalAuthentication {
    constructor(
        private readonly passwordProtection: PasswordProtection,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(token: string): void {
        const plainToken = token.trim().toUpperCase();
        const registerTerminal = this.db
            .table('レジ端末')
            .find(this.db.query('レジ端末'))
            .find(
                (terminal) =>
                    terminal.enabled &&
                    terminal.tokenHash ===
                        this.passwordProtection.execute(plainToken, terminal.id)
            );

        if (!registerTerminal) {
            throw new UnauthorizedError();
        }

        registerTerminal.use(new Date().toISOString());
        this.db.table('レジ端末').update([registerTerminal]);
    }
}
