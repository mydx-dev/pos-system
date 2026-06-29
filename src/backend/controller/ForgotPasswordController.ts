import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import {
    ForgotPasswordInput,
    forgotPasswordInputSchema,
    ForgotPasswordOutput,
} from '../../shared/api/user';
import { ForgotPasswordUseCase } from '../application/usecase/ForgotPasswordUseCase';

export class ForgotPasswordController {
    constructor(
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase
    ) {}
    execute(
        input: ForgotPasswordInput
    ): AppsScriptServerResponse<ForgotPasswordOutput> {
        const parsedInput = forgotPasswordInputSchema.parse(input);
        const result = this.forgotPasswordUseCase.execute(parsedInput.email);
        return new AppsScriptServerResponse(result);
    }
}
