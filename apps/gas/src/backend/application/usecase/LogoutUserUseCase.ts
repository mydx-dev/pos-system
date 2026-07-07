export class LogoutUserUseCase {
    constructor(private cache: GoogleAppsScript.Cache.Cache) {}

    execute(sessionToken: string) {
        this.cache.remove(sessionToken);
        return { ok: true };
    }
}
