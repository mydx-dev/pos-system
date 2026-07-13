import type { RoleName } from '@mydx-pos/shared/domain/entity/Role';

export type ManagementUserRecord = {
    id: string;
    name: string;
    email: string;
    password: string;
    approval: number;
    version: number;
    role: RoleName;
};

const changedRows = (result: D1Result) => {
    const changes = result.meta.changes;
    return typeof changes === 'number' ? changes : 0;
};

export class ManagementRepository {
    constructor(private readonly db: D1Database) {}

    findUserWithRoleById(id: string) {
        return this.db
            .prepare(
                `SELECT
                    users.id,
                    users.name,
                    users.email,
                    users.password,
                    users.approval,
                    users.version,
                    roles.name AS role
                 FROM users
                 INNER JOIN roles ON roles.user_id = users.id
                 WHERE users.id = ?
                 LIMIT 1`
            )
            .bind(id)
            .first<ManagementUserRecord>();
    }

    async countApprovedSystemAdmins() {
        const result = await this.db
            .prepare(
                `SELECT COUNT(*) AS count
                 FROM users
                 INNER JOIN roles ON roles.user_id = users.id
                 WHERE users.approval = 1 AND roles.name = 'システム管理者'`
            )
            .first<{ count: number }>();

        return result?.count ?? 0;
    }

    async updateApproval(id: string, version: number, approval: boolean) {
        const result = await this.db
            .prepare(
                `UPDATE users
                 SET approval = ?, version = version + 1
                 WHERE id = ? AND version = ?`
            )
            .bind(approval ? 1 : 0, id, version)
            .run();

        return changedRows(result) === 1;
    }

    async updateUser(
        id: string,
        version: number,
        input: { name: string; email: string }
    ) {
        const results = await this.db.batch<D1Result[]>([
            this.db
                .prepare(
                    `UPDATE user
                     SET name = ?, email = ?, updated_at = ?
                     WHERE id = ?
                       AND EXISTS (
                         SELECT 1 FROM users WHERE id = ? AND version = ?
                       )`
                )
                .bind(input.name, input.email, Date.now(), id, id, version),
            this.db
                .prepare(
                    `UPDATE users
                     SET name = ?, email = ?, version = version + 1
                     WHERE id = ? AND version = ?`
                )
                .bind(input.name, input.email, id, version),
        ]);

        return changedRows(results[1]) === 1;
    }

    async deleteUser(id: string) {
        const results = await this.db.batch<D1Result[]>([
            this.db.prepare('DELETE FROM users WHERE id = ?').bind(id),
            this.db.prepare('DELETE FROM user WHERE id = ?').bind(id),
        ]);

        return changedRows(results[0]) === 1;
    }
}
