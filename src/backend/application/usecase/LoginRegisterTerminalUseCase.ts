import { UnauthorizedError, SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import {
    LoginRegisterTerminalRequest,
    LoginRegisterTerminalResponse,
} from '../../../shared/api/registerTerminal';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';

export class LoginRegisterTerminalUseCase {
    constructor(
        private readonly passwordProtection: PasswordProtection,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute({
        token,
    }: LoginRegisterTerminalRequest): LoginRegisterTerminalResponse {
        const plainToken = token.trim().toUpperCase();
        const registerTerminal = this.db
            .table('レジ端末')
            .find(this.db.query('レジ端末').and('有効', '=', [true]))
            .find(
                (terminal) =>
                    terminal.tokenHash ===
                    this.passwordProtection.execute(plainToken, terminal.id)
            );

        if (!registerTerminal) {
            throw new UnauthorizedError();
        }

        const usedAt = new Date().toISOString();
        registerTerminal.use(usedAt);
        const savedRegisterTerminal = this.db
            .table('レジ端末')
            .update([registerTerminal])[0];

        return {
            registerTerminal: {
                ID: savedRegisterTerminal.id,
                端末名: savedRegisterTerminal.name,
                有効: savedRegisterTerminal.enabled,
                最終利用日時: usedAt,
            },
        };
    }
}
