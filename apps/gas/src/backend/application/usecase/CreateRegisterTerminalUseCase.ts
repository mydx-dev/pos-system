import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateRegisterTerminalRequest,
    CreateRegisterTerminalResponse,
} from '@mydx-pos/shared/api/registerTerminal';
import { RegisterTerminalPlaneToken } from '@mydx-pos/shared/domain/valueObject/RegisterTerminalPlaneToken';
import {
    ALL_TABLES,
    RegisterTerminalTable,
} from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';
import { PermissionCheck } from '../service/PermissionCheck';

export class CreateRegisterTerminalUseCase {
    constructor(
        private readonly utilities: GoogleAppsScript.Utilities.Utilities,
        private readonly passwordProtection: PasswordProtection,
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>
    ) {}

    execute(
        userId: string,
        { terminal }: Pick<CreateRegisterTerminalRequest, 'terminal'>
    ): CreateRegisterTerminalResponse {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (!this.permissionCheck.hasRole(userId, 'システム管理者').hasRole) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        const id = this.utilities.getUuid();
        const plainToken = new RegisterTerminalPlaneToken().value;
        const tokenHash = this.passwordProtection.execute(plainToken, id);
        const issuedAt = new Date().toISOString();

        const registerTerminal = this.db.table('レジ端末').create([
            {
                ID: id,
                端末名: terminal.端末名,
                トークンハッシュ: tokenHash,
                有効: true,
                発行日時: issuedAt,
                最終利用日時: null,
                登録者ID: userId,
                更新者ID: null,
                バージョン: 1,
            },
        ])[0];

        const { トークンハッシュ, 登録者ID, 更新者ID, ...serialized } =
            RegisterTerminalTable.serialize(registerTerminal);
        void トークンハッシュ;
        void 登録者ID;
        void 更新者ID;

        return {
            registerTerminal: serialized,
            plainToken,
        };
    }
}
