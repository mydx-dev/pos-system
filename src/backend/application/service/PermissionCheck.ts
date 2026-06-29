import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class PermissionCheck {
    constructor(private readonly db: SheetDB<typeof ALL_TABLES>) {}

    isApprovedDeveloper(userId: string): boolean {
        const userQuery = this.db
            .query('ユーザー')
            .and('承認', '=', [true])
            .and('ID', '=', [userId]);

        const developers = this.db
            .table('ユーザー')
            .find(userQuery.join('ID', 'ロール', 'ユーザーID'));
        return (
            developers.length > 0 &&
            developers.every((dev) => dev.isDeveloper())
        );
    }

    isApprovedDeveloperOrSystemAdmin(userId: string): boolean {
        const userQuery = this.db
            .query('ユーザー')
            .and('承認', '=', [true])
            .and('ID', '=', [userId]);

        const users = this.db
            .table('ユーザー')
            .find(userQuery.join('ID', 'ロール', 'ユーザーID'));

        return (
            users.length > 0 &&
            users.every((user) => user.isDeveloper() || user.isAdmin())
        );
    }
}
