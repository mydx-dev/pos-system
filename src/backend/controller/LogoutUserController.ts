import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import {
    LogoutUserInput,
    logoutUserInputSchema,
    LogoutUserOutput,
} from '../../shared/api/user';
import { LogoutUserUseCase } from '../application/usecase/LogoutUserUseCase';

export class LogoutUserController {
    constructor(private readonly logoutUserUseCase: LogoutUserUseCase) {}
    execute(
        input: LogoutUserInput
    ): AppsScriptServerResponse<LogoutUserOutput> {
        const parsedInput = logoutUserInputSchema.parse(input);
        const result = this.logoutUserUseCase.execute(parsedInput);
        return new AppsScriptServerResponse(result);
    }
}
