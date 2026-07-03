import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { RoleName } from '../../../shared/domain/entity/Role';
import { User } from '../../../shared/domain/entity/User';
import { ALL_TABLES } from '../../infrastructure/database/tables';

type NotHaveRole = { hasRole: false; user: null };
type HaveRole = { hasRole: true; user: User };

export type RoleCheckResult = NotHaveRole | HaveRole;

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

    hasRole(userId: string, roleName: RoleName): RoleCheckResult {
        const userQuery = this.db
            .query('ユーザー')
            .and('承認', '=', [true])
            .and('ID', '=', [userId]);

        const user = this.db
            .table('ユーザー')
            .find(userQuery.join('ID', 'ロール', 'ユーザーID'))[0];

        if (!user || user.hasRole(roleName) === false) {
            return { hasRole: false, user: null };
        }

        return {
            hasRole: true,
            user: user,
        };
    }

    isApprovedSystemAdminOrEmployee(userId: string): boolean {
        const userQuery = this.db
            .query('ユーザー')
            .and('承認', '=', [true])
            .and('ID', '=', [userId]);

        const user = this.db
            .table('ユーザー')
            .find(userQuery.join('ID', 'ロール', 'ユーザーID'))[0];

        if (!user) {
            return false;
        }

        if (user.isAdmin()) {
            return true;
        }

        const employees = this.db
            .table('スタッフ')
            .find(this.db.query('スタッフ').and('ユーザーID', '=', [userId]));

        return employees.length > 0;
    }

    isApprovedSystemAdminOrEmployeeOrRegisterTerminal(userId: string): boolean {
        const userQuery = this.db
            .query('ユーザー')
            .and('承認', '=', [true])
            .and('ID', '=', [userId]);

        const user = this.db
            .table('ユーザー')
            .find(userQuery.join('ID', 'ロール', 'ユーザーID'))[0];

        if (!user) {
            return false;
        }

        if (user.isAdmin() || user.isRegisterTerminal()) {
            return true;
        }

        const employees = this.db
            .table('スタッフ')
            .find(this.db.query('スタッフ').and('ユーザーID', '=', [userId]));

        return employees.length > 0;
    }
}
