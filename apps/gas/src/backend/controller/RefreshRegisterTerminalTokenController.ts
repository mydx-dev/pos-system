import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    RefreshRegisterTerminalTokenRequest,
    RefreshRegisterTerminalTokenResponse,
    refreshRegisterTerminalTokenRequest,
} from '../../shared/api/registerTerminal';
import { Authentication } from '../application/service/Authentication';
import { RefreshRegisterTerminalTokenUseCase } from '../application/usecase/RefreshRegisterTerminalTokenUseCase';

export class RefreshRegisterTerminalTokenController {
    constructor(
        private readonly authentication: Authentication,
        private readonly refreshRegisterTerminalTokenUseCase: RefreshRegisterTerminalTokenUseCase
    ) {}

    execute(
        input: RefreshRegisterTerminalTokenRequest
    ): AppsScriptServerResponse<RefreshRegisterTerminalTokenResponse> {
        const parsedInput =
            refreshRegisterTerminalTokenRequest.safeParse(input);
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
            this.refreshRegisterTerminalTokenUseCase.execute(
                userId,
                parsedInput.data
            )
        );
    }
}
