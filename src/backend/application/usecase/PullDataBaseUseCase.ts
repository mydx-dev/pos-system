import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { PullDatabaseOutput } from '../../../shared/api/system';
import {
    ALL_TABLES,
    MenuTable,
    PaymentRecordTable,
    RoleTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from '../../infrastructure/database/tables';

const syncTable = (
    table:
        | typeof UserTable
        | typeof RoleTable
        | typeof TreatmentTable
        | typeof MenuTable
        | typeof TreatmentMenuTable
        | typeof PaymentRecordTable
) => ({
    name: table.name,
    primaryKey: table.primaryKey as string,
});

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
            table: syncTable(UserTable),
            records: users.map((user) => user.serializeEmptyPassword()),
        });

        const permissions = this.db.table('ロール').find(permissionQuery);
        result.push({
            table: syncTable(RoleTable),
            records: permissions.map((permission) =>
                RoleTable.serialize(permission)
            ),
        });

        const treatments = this.db.table('施術').find(this.db.query('施術'));
        result.push({
            table: syncTable(TreatmentTable),
            records: treatments.map((treatment) =>
                TreatmentTable.serialize(treatment)
            ),
        });

        return result;
    }
}
