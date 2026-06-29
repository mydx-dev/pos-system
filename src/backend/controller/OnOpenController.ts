import { systemName } from '../../shared/config';
import { DoGetUseCase } from '../application/usecase/DoGetUseCase';

export class OnOpenController {
    constructor(
        private readonly spreadsheetApp: Pick<
            GoogleAppsScript.Spreadsheet.SpreadsheetApp,
            'getUi'
        >
    ) {}
    execute() {
        const ui = this.spreadsheetApp.getUi();
        ui.createMenu('アプリ').addItem('開く', 'open').addToUi();
    }
}

export class OpenController {
    constructor(
        private readonly doGetUseCase: DoGetUseCase,
        private readonly spreadsheetApp: Pick<
            GoogleAppsScript.Spreadsheet.SpreadsheetApp,
            'getUi'
        >
    ) {}

    execute() {
        const htmlOutput = this.doGetUseCase.execute();
        this.spreadsheetApp.getUi().showModalDialog(htmlOutput, systemName);
    }
}
