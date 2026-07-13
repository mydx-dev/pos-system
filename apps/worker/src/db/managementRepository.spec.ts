/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import { ManagementRepository } from './managementRepository';

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

const createRepository = () => {
    const sqlite = new DatabaseSync(':memory:');
    applyMigration(sqlite, '0001_initial_schema.sql');
    applyMigration(sqlite, '0004_better_auth.sql');

    const d1 = new TestD1Database(sqlite) as unknown as D1Database;
    return {
        sqlite,
        repository: new ManagementRepository(d1),
    };
};

const admin1Id = '00000000-0000-4000-8000-000000000001';
const admin2Id = '00000000-0000-4000-8000-000000000002';

const insertUser = (
    sqlite: DatabaseSync,
    input: {
        id: string;
        name: string;
        email: string;
        approval: number;
        role: 'システム管理者' | 'ユーザー';
    }
) => {
    sqlite
        .prepare(
            `INSERT INTO users (id, name, email, password, approval, version)
             VALUES (?, ?, ?, ?, ?, 1)`
        )
        .run(input.id, input.name, input.email, 'secret', input.approval);
    sqlite
        .prepare('INSERT INTO roles (user_id, name) VALUES (?, ?)')
        .run(input.id, input.role);
    sqlite
        .prepare(
            `INSERT INTO user (id, name, email, email_verified, updated_at)
             VALUES (?, ?, ?, 0, ?)`
        )
        .run(input.id, input.name, input.email, Date.now());
};

const insertApprovedAdmins = (sqlite: DatabaseSync) => {
    insertUser(sqlite, {
        id: admin1Id,
        name: 'Admin One',
        email: 'admin1@example.com',
        approval: 1,
        role: 'システム管理者',
    });
    insertUser(sqlite, {
        id: admin2Id,
        name: 'Admin Two',
        email: 'admin2@example.com',
        approval: 1,
        role: 'システム管理者',
    });
};

describe('ManagementRepository', () => {
    it('prevents unapproving the last approved system administrator in the update statement', async () => {
        const { sqlite, repository } = createRepository();
        insertApprovedAdmins(sqlite);

        await expect(
            repository.updateApproval(admin2Id, 1, false)
        ).resolves.toBe(true);
        await expect(
            repository.updateApproval(admin1Id, 1, false)
        ).resolves.toBe(false);

        expect(
            sqlite
                .prepare('SELECT approval, version FROM users WHERE id = ?')
                .get(admin1Id)
        ).toEqual({
            approval: 1,
            version: 1,
        });
    });

    it('prevents deleting the last approved system administrator and keeps the Better Auth user', async () => {
        const { sqlite, repository } = createRepository();
        insertApprovedAdmins(sqlite);

        await expect(repository.deleteUser(admin2Id)).resolves.toBe(true);
        await expect(repository.deleteUser(admin1Id)).resolves.toBe(false);

        expect(
            sqlite.prepare('SELECT id FROM users WHERE id = ?').get(admin1Id)
        ).toEqual({ id: admin1Id });
        expect(
            sqlite.prepare('SELECT id FROM user WHERE id = ?').get(admin1Id)
        ).toEqual({ id: admin1Id });
    });
});
