export class IsSetupCompletedUseCase {
    constructor(
        private properties: GoogleAppsScript.Properties.Properties,
        private isSetupCompletedKey: string
    ) {}

    execute(): boolean {
        const isSetupCompleted = this.properties.getProperty(
            this.isSetupCompletedKey
        );
        return isSetupCompleted === 'true';
    }
}
