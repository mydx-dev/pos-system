import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import {
    ResetPasswordInput,
    resetPasswordInputSchema,
    ResetPasswordOutput,
} from '../../shared/api/user';
import { ResetPasswordUseCase } from '../application/usecase/ResetPasswordUseCase';

export class ResetPasswordController {
    constructor(private readonly resetPasswordUseCase: ResetPasswordUseCase) {}
    execute(
        input: ResetPasswordInput
    ): AppsScriptServerResponse<ResetPasswordOutput> {
        const parsedInput = resetPasswordInputSchema.parse(input);
        const result = this.resetPasswordUseCase.execute(
            parsedInput.token,
            parsedInput.newPassword
        );
        return new AppsScriptServerResponse(result);
    }
}
