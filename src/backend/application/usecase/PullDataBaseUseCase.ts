import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { PullDatabaseOutput } from '../../../shared/api/system';
import {
    ALL_TABLES,
    RoleTable,
    UserTable,
} from '../../infrastructure/database/tables';

export class PullDataBaseUseCase {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}
    execute(userId: string): PullDatabaseOutput {
        let users = this.db
            .table('ユーザー')
            .find(this.db.query('ユーザー').join('ID', 'ロール', 'ユーザーID'));

        const me = users.filter((user) => user.id === userId)[0];

        if (!me) {
            throw new Error('User not found');
        }

        const result: PullDatabaseOutput = [];
        const permissionQuery = this.db.query('ロール');

        if (!me.isAdmin() && !me.isDeveloper()) {
            users = users.filter((user) => user.id === me.id);
            permissionQuery.and('ユーザーID', '=', [me.id]);
        }

        result.push({
            table: UserTable,
            records: users.map((user) => user.serializeEmptyPassword()),
        });

        const permissions = this.db.table('ロール').find(permissionQuery);
        result.push({
            table: RoleTable,
            records: permissions.map((permission) =>
                RoleTable.serialize(permission)
            ),
        });

        return result;
    }
}
