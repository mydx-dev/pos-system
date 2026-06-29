export class IsTermsAcceptedUseCase {
    constructor(
        private readonly properties: GoogleAppsScript.Properties.Properties,
        private readonly isTermsAcceptedKey: string
    ) {}
    execute() {
        const accepted = this.properties.getProperty(this.isTermsAcceptedKey);
        return accepted === 'true';
    }
}
