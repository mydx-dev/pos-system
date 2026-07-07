import { SSR } from '../../../shared/api';
import { systemName } from '../../../shared/config';

export class DoGetUseCase {
    constructor(
        private htmlService: Pick<
            GoogleAppsScript.HTML.HtmlService,
            'createTemplateFromFile'
        >,
        private properties: GoogleAppsScript.Properties.Properties,
        private isSetupCompletedKey: string,
        private isTermsAcceptedKey: string,
        private scriptApp: Pick<
            GoogleAppsScript.Script.ScriptApp,
            'getScriptId'
        >,
        private xFrameOptionsMode: GoogleAppsScript.HTML.XFrameOptionsMode.ALLOWALL
    ) {}
    execute() {
        const isSetupCompleted = this.properties.getProperty(
            this.isSetupCompletedKey
        );
        const isTermsAccepted = this.properties.getProperty(
            this.isTermsAcceptedKey
        );

        const template = this.htmlService.createTemplateFromFile('index');
        const ssr: SSR = {
            isSetupCompleted: isSetupCompleted === 'true',
            isTermsAccepted: isTermsAccepted === 'true',
            scriptId: this.scriptApp.getScriptId(),
        };

        template.ssr = JSON.stringify(ssr);
        return template
            .evaluate()
            .addMetaTag('viewport', 'width=device-width, initial-scale=1')
            .setXFrameOptionsMode(this.xFrameOptionsMode)
            .setTitle(systemName);
    }
}
