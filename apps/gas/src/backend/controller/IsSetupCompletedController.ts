import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { IsSetupCompletedUseCase } from '../application/usecase/IsSetupCompletedUseCase';

export class IsSetupCompletedController {
    constructor(
        private readonly isSetupCompletedUseCase: IsSetupCompletedUseCase
    ) {}
    execute(): AppsScriptServerResponse<boolean> {
        const result = this.isSetupCompletedUseCase.execute();
        return new AppsScriptServerResponse(result);
    }
}
