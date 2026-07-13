import type { RoleName } from '@mydx-pos/shared/domain/entity/Role';

export const betterAuthManagedPasswordMarker = 'better-auth-managed';

export type CreateUserRecord = {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    approval: boolean;
    role: RoleName;
};

export type UserWithRole = {
    id: string;
    name: string;
    email: string;
    password: string;
    approval: number;
    role: RoleName;
};

const changedRows = (result: D1Result) => {
    const changes = result.meta.changes;
    return typeof changes === 'number' ? changes : 0;
};

export class AuthRepository {
    constructor(private readonly db: D1Database) {}

    async isSetupCompleted() {
        const setting = await this.db
            .prepare("SELECT value FROM settings WHERE key = 'setup_completed'")
            .first<{ value: string }>();

        if (setting?.value === 'true' || setting?.value === 'false') {
            return setting.value === 'true';
        }

        const admin = await this.db
            .prepare(
                "SELECT 1 AS ok FROM roles WHERE name = 'システム管理者' LIMIT 1"
            )
            .first<{ ok: number }>();

        return admin?.ok === 1;
    }

    async isTermsAccepted() {
        const setting = await this.db
            .prepare("SELECT value FROM settings WHERE key = 'terms_accepted'")
            .first<{ value: string }>();

        return setting?.value === 'true';
    }

    async setBooleanSetting(key: string, value: boolean) {
        await this.db
            .prepare(
                `INSERT INTO settings (key, value, updated_at)
                 VALUES (?, ?, ?)
                 ON CONFLICT(key) DO UPDATE SET
                    value = excluded.value,
                    updated_at = excluded.updated_at`
            )
            .bind(key, String(value), new Date().toISOString())
            .run();
    }

    async countSystemAdmins() {
        const result = await this.db
            .prepare(
                "SELECT COUNT(*) AS count FROM roles WHERE name = 'システム管理者'"
            )
            .first<{ count: number }>();

        return result?.count ?? 0;
    }

    async tryAcquireSetupLock() {
        const result = await this.db
            .prepare(
                `INSERT INTO settings (key, value, updated_at)
                 VALUES ('setup_completed', 'creating', ?)
                 ON CONFLICT(key) DO NOTHING`
            )
            .bind(new Date().toISOString())
            .run();

        return changedRows(result) === 1;
    }

    async releaseSetupLock() {
        await this.db
            .prepare(
                "DELETE FROM settings WHERE key = 'setup_completed' AND value = 'creating'"
            )
            .run();
    }

    async createUser(user: CreateUserRecord) {
        await this.db.batch([
            this.db
                .prepare(
                    `INSERT INTO users
                        (id, name, email, password, approval, version)
                     VALUES (?, ?, ?, ?, ?, 1)`
                )
                .bind(
                    user.id,
                    user.name,
                    user.email,
                    user.passwordHash,
                    user.approval ? 1 : 0
                ),
            this.db
                .prepare('INSERT INTO roles (user_id, name) VALUES (?, ?)')
                .bind(user.id, user.role),
        ]);
    }

    async deleteBetterAuthUser(userId: string) {
        await this.db.prepare('DELETE FROM user WHERE id = ?').bind(userId).run();
    }

    async findApprovedUserByEmail(email: string) {
        return this.db
            .prepare(
                `SELECT
                    users.id,
                    users.name,
                    users.email,
                    users.password,
                    users.approval,
                    roles.name AS role
                 FROM users
                 INNER JOIN roles ON roles.user_id = users.id
                 WHERE users.email = ? AND users.approval = 1
                 LIMIT 1`
            )
            .bind(email)
            .first<UserWithRole>();
    }

    async findUserByEmail(email: string) {
        return this.db
            .prepare('SELECT id, email FROM users WHERE email = ? LIMIT 1')
            .bind(email)
            .first<{ id: string; email: string }>();
    }

    async findApprovedUserProfileByEmail(email: string) {
        return this.db
            .prepare(
                `SELECT
                    users.id,
                    users.email,
                    users.approval,
                    roles.name AS role
                 FROM users
                 INNER JOIN roles ON roles.user_id = users.id
                 WHERE users.email = ? AND users.approval = 1
                 LIMIT 1`
            )
            .bind(email)
            .first<{
                id: string;
                email: string;
                approval: number;
                role: RoleName;
            }>();
    }

    async findUserByResetTokenHash(tokenHash: string) {
        return this.db
            .prepare(
                `SELECT
                    users.id,
                    password_resets.expires_at
                 FROM password_resets
                 INNER JOIN users ON users.id = password_resets.user_id
                 WHERE password_resets.token = ?
                 LIMIT 1`
            )
            .bind(tokenHash)
            .first<{ id: string; expires_at: number }>();
    }

    async replacePasswordReset(
        userId: string,
        tokenHash: string,
        expiresAt: number
    ) {
        await this.db
            .prepare(
                `INSERT INTO password_resets (user_id, token, expires_at)
                 VALUES (?, ?, ?)
                 ON CONFLICT(user_id) DO UPDATE SET
                    token = excluded.token,
                    expires_at = excluded.expires_at`
            )
            .bind(userId, tokenHash, expiresAt)
            .run();
    }

    async updatePassword(userId: string, passwordHash: string) {
        await this.db.batch([
            this.db
                .prepare(
                    'UPDATE users SET password = ?, version = version + 1 WHERE id = ?'
                )
                .bind(passwordHash, userId),
            this.db
                .prepare('DELETE FROM password_resets WHERE user_id = ?')
                .bind(userId),
        ]);
    }

    async createBetterAuthPasswordResetVerification(
        token: string,
        userId: string,
        expiresAt: number
    ) {
        const now = Date.now();
        await this.db
            .prepare(
                `INSERT INTO verification
                    (id, identifier, value, expires_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`
            )
            .bind(
                crypto.randomUUID(),
                `reset-password:${token}`,
                userId,
                expiresAt,
                now,
                now
            )
            .run();
    }

    async markPasswordAsBetterAuthManaged(userId: string) {
        await this.db.batch([
            this.db
                .prepare(
                    'UPDATE users SET password = ?, version = version + 1 WHERE id = ?'
                )
                .bind(betterAuthManagedPasswordMarker, userId),
            this.db
                .prepare('DELETE FROM password_resets WHERE user_id = ?')
                .bind(userId),
        ]);
    }

    async createSession(tokenHash: string, userId: string, expiresAt: number) {
        await this.db
            .prepare(
                `INSERT INTO sessions (token_hash, user_id, expires_at, created_at)
                 VALUES (?, ?, ?, ?)`
            )
            .bind(tokenHash, userId, expiresAt, new Date().toISOString())
            .run();
    }

    async deleteSession(tokenHash: string) {
        await this.db
            .prepare('DELETE FROM sessions WHERE token_hash = ?')
            .bind(tokenHash)
            .run();
    }
}
