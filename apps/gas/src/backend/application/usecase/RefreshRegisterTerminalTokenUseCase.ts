import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    RefreshRegisterTerminalTokenRequest,
    RefreshRegisterTerminalTokenResponse,
} from '@mydx-pos/shared/api/registerTerminal';
import { RegisterTerminalPlaneToken } from '@mydx-pos/shared/domain/valueObject/RegisterTerminalPlaneToken';
import {
    ALL_TABLES,
    RegisterTerminalTable,
} from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';
import { PermissionCheck } from '../service/PermissionCheck';

export class RefreshRegisterTerminalTokenUseCase {
    constructor(
        private readonly passwordProtection: PasswordProtection,
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(
        userId: string,
        {
            registerTerminalId,
            バージョン,
        }: Omit<RefreshRegisterTerminalTokenRequest, 'sessionToken'>
    ): RefreshRegisterTerminalTokenResponse {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (!this.permissionCheck.hasRole(userId, 'システム管理者').hasRole) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        const registerTerminal = this.db
            .table('レジ端末')
            .find(
                this.db
                    .query('レジ端末')
                    .and('ID', '=', [registerTerminalId])
                    .and('バージョン', '=', [バージョン])
            )[0];

        if (!registerTerminal) {
            throw new InvalidArgumentError('Register terminal not found');
        }

        const plainToken = new RegisterTerminalPlaneToken().value;
        const tokenHash = this.passwordProtection.execute(
            plainToken,
            registerTerminal.id
        );
        registerTerminal.refreshToken(
            tokenHash,
            new Date().toISOString(),
            userId
        );

        const savedRegisterTerminal = this.db
            .table('レジ端末')
            .update([registerTerminal])[0];

        const { トークンハッシュ, 登録者ID, 更新者ID, ...serialized } =
            RegisterTerminalTable.serialize(savedRegisterTerminal);
        void トークンハッシュ;
        void 登録者ID;
        void 更新者ID;

        return {
            registerTerminal: serialized,
            plainToken,
        };
    }
}
