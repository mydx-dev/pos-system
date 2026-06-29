import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class SystemAdmins {
    constructor(private db: SheetDB<typeof ALL_TABLES>) {}
    search(): User[] {
        return this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('承認', '=', [true])
                    .join(
                        'ID',
                        'ロール',
                        'ユーザーID',
                        this.db
                            .query('ロール')
                            .and('名称', '=', ['システム管理者'])
                    )
            )
            .filter((user) => user.isAdmin());
    }
}
