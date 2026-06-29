export class AcceptTermsUseCase {
    constructor(
        private readonly properties: GoogleAppsScript.Properties.Properties,
        private readonly isTermsAcceptedKey: string
    ) {}
    execute() {
        this.properties.setProperty(this.isTermsAcceptedKey, 'true');
        return true;
    }
}
