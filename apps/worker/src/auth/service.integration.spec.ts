/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { AuthService } from './service';
import { createAuth } from './createAuth';
import { hashToken } from './crypto';

type SqliteValue = string | number | null | Uint8Array;

class TestD1PreparedStatement {
    constructor(
        private readonly db: DatabaseSync,
        private readonly sql: string,
        private readonly params: SqliteValue[] = []
    ) {}

    bind(...params: SqliteValue[]) {
        return new TestD1PreparedStatement(this.db, this.sql, params);
    }

    async run() {
        const result = this.statement().run(...this.params);

        return {
            success: true,
            meta: {
                changes: result.changes,
                last_row_id: result.lastInsertRowid,
            },
        };
    }

    async first<T = Record<string, unknown>>() {
        return (this.statement().get(...this.params) ?? null) as T | null;
    }

    async all<T = Record<string, unknown>>() {
        return {
            success: true,
            results: this.statement().all(...this.params) as T[],
            meta: {},
        };
    }

    async raw<T = unknown[]>() {
        const rows = this.statement().all(...this.params) as Record<
            string,
            unknown
        >[];

        return rows.map((row) => Object.values(row)) as T[];
    }

    private statement() {
        return this.db.prepare(this.sql);
    }
}

class TestD1Database {
    constructor(private readonly db: DatabaseSync) {}

    prepare(sql: string) {
        return new TestD1PreparedStatement(this.db, sql);
    }

    async batch<T = unknown>(statements: TestD1PreparedStatement[]) {
        this.db.exec('BEGIN');
        try {
            const results = [];
            for (const statement of statements) {
                results.push(await statement.run());
            }
            this.db.exec('COMMIT');
            return results as T[];
        } catch (caught) {
            this.db.exec('ROLLBACK');
            throw caught;
        }
    }
}

const applyMigration = (db: DatabaseSync, filename: string) => {
    const migration = readFileSync(
        new URL(`../../migrations/${filename}`, import.meta.url),
        'utf8'
    );
    db.exec(migration);
};

const createTestEnv = () => {
    const sqlite = new DatabaseSync(':memory:');
    applyMigration(sqlite, '0001_initial_schema.sql');
    applyMigration(sqlite, '0002_worker_auth_state.sql');
    applyMigration(sqlite, '0004_better_auth.sql');

    return {
        DB: new TestD1Database(sqlite) as unknown as D1Database,
        ENVIRONMENT: 'local',
        CORS_ALLOWED_ORIGINS: 'http://localhost:5173',
        PASSWORD_PEPPER: '00000000-0000-4000-8000-000000000000',
        BETTER_AUTH_URL: 'http://localhost:8787',
        BETTER_AUTH_SECRET:
            'test-better-auth-secret-that-is-long-enough-for-tests',
        TRUSTED_ORIGINS: 'http://localhost:5173',
    } as unknown as Env;
};

const signInWithBetterAuth = (env: Env, email: string, password: string) =>
    createAuth(env, env.BETTER_AUTH_URL).api.signInEmail({
        body: {
            email,
            password,
            rememberMe: false,
        },
        headers: new Headers({
            origin: env.BETTER_AUTH_URL,
        }),
    });

describe('AuthService Better Auth integration', () => {
    it('resets a Better Auth managed password and allows login with the new password', async () => {
        const env = createTestEnv();
        const service = new AuthService(env);

        const user = await service.createUser({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'Password1',
        });
        await expect(
            signInWithBetterAuth(env, 'admin@example.com', 'Password1')
        ).resolves.toMatchObject({
            user: {
                id: user.id,
                email: 'admin@example.com',
            },
        });

        const resetToken = 'reset-token';
        await env.DB.prepare(
            `INSERT INTO password_resets (user_id, token, expires_at)
             VALUES (?, ?, ?)`
        )
            .bind(user.id, await hashToken(resetToken), Date.now() + 60_000)
            .run();

        await expect(
            service.resetPassword({
                token: resetToken,
                newPassword: 'Password2',
            })
        ).resolves.toEqual({ ok: true });

        await expect(
            signInWithBetterAuth(env, 'admin@example.com', 'Password1')
        ).rejects.toThrow();
        await expect(
            signInWithBetterAuth(env, 'admin@example.com', 'Password2')
        ).resolves.toMatchObject({
            user: {
                id: user.id,
                email: 'admin@example.com',
            },
        });
        await expect(
            service.loginUser({
                email: 'admin@example.com',
                password: 'Password2',
            })
        ).resolves.toMatchObject({
            userId: user.id,
            sessionToken: expect.any(String),
        });
    });
});
