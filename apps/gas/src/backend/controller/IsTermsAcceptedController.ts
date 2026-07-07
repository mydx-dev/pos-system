import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { IsTermsAcceptedUseCase } from '../application/usecase/IsTermsAcceptedUseCase';

export class IsTermsAcceptedController {
    constructor(private isTermsAcceptedUseCase: IsTermsAcceptedUseCase) {}
    execute() {
        const result = this.isTermsAcceptedUseCase.execute();
        return new AppsScriptServerResponse(result);
    }
}
