import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import { AcceptTermsUseCase } from '../application/usecase/AcceptTermsUseCase';

export class AcceptTermsController {
    constructor(private readonly acceptTermsUseCase: AcceptTermsUseCase) {}
    execute(): AppsScriptServerResponse<boolean> {
        const result = this.acceptTermsUseCase.execute();
        return new AppsScriptServerResponse(result);
    }
}
