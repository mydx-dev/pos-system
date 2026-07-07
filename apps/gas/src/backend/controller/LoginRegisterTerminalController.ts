import {
    AppsScriptServerResponse,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    LoginRegisterTerminalRequest,
    LoginRegisterTerminalResponse,
    loginRegisterTerminalRequest,
} from '@mydx-pos/shared/api/registerTerminal';
import { LoginRegisterTerminalUseCase } from '../application/usecase/LoginRegisterTerminalUseCase';

export class LoginRegisterTerminalController {
    constructor(
        private readonly loginRegisterTerminalUseCase: LoginRegisterTerminalUseCase
    ) {}

    execute(
        input: LoginRegisterTerminalRequest
    ): AppsScriptServerResponse<LoginRegisterTerminalResponse> {
        const parsedInput = loginRegisterTerminalRequest.safeParse(input);
        if (!parsedInput.success) {
            throw new InvalidArgumentError(
                'Invalid input',
                parsedInput.error.message
            );
        }

        return new AppsScriptServerResponse(
            this.loginRegisterTerminalUseCase.execute(parsedInput.data)
        );
    }
}
