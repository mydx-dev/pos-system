export class PasswordProtection {
    constructor(
        private utilities: GoogleAppsScript.Utilities.Utilities,
        private properties: GoogleAppsScript.Properties.Properties
    ) {}

    execute(planetextPassword: string, salt: string): string {
        const pepper = this.properties.getProperty('PASSWORD_PEPPER');
        if (!pepper) {
            throw new Error('PASSWORD_PEPPER is not set in script properties');
        }

        const pepperRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!pepperRegex.test(pepper)) {
            throw new Error('PASSWORD_PEPPER is invalid format');
        }

        const hash = this.utilities.computeDigest(
            this.utilities.DigestAlgorithm.SHA_256,
            planetextPassword + salt + pepper
        );
        return this.utilities.base64Encode(hash);
    }
}
