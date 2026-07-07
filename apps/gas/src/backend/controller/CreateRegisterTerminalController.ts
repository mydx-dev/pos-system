import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateRegisterTerminalRequest,
    CreateRegisterTerminalResponse,
    createRegisterTerminalRequest,
} from '../../shared/api/registerTerminal';
import { Authentication } from '../application/service/Authentication';
import { CreateRegisterTerminalUseCase } from '../application/usecase/CreateRegisterTerminalUseCase';

export class CreateRegisterTerminalController {
    constructor(
        private readonly authentication: Authentication,
        private readonly createRegisterTerminalUseCase: CreateRegisterTerminalUseCase
    ) {}

    execute(
        input: CreateRegisterTerminalRequest
    ): AppsScriptServerResponse<CreateRegisterTerminalResponse> {
        const parsedInput = createRegisterTerminalRequest.safeParse(input);
        if (!parsedInput.success) {
            throw new InvalidArgumentError(
                'Invalid input',
                parsedInput.error.message
            );
        }

        let userId: string;
        try {
            userId = this.authentication.execute(parsedInput.data.sessionToken);
        } catch {
            throw new UnauthorizedError();
        }

        return new AppsScriptServerResponse(
            this.createRegisterTerminalUseCase.execute(userId, parsedInput.data)
        );
    }
}
