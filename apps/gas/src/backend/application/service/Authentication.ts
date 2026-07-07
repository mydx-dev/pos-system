export class Authentication {
    constructor(private cache: GoogleAppsScript.Cache.Cache) {}
    execute(sessionToken: string) {
        if (!sessionToken) throw new Error('Session token is required');
        const userId = this.cache.get(sessionToken);
        if (!userId) throw new Error('Invalid session token');
        this.cache.put(sessionToken, userId, 20 * 60);
        return userId;
    }
}
