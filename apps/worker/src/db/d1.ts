export const pingD1 = async (db: D1Database) => {
    const result = await db.prepare('SELECT 1 AS ok').first<{ ok: number }>();

    return result?.ok === 1;
};
