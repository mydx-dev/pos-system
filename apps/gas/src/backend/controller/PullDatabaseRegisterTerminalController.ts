import {
    AppsScriptServerResponse,
    InvalidArgumentError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    PullDatabaseRegisterTerminalInput,
    PullDatabaseRegisterTerminalOutput,
    pullDatabaseRegisterTerminalInput,
} from '@mydx-pos/shared/api/system';
import { RegisterTerminalAuthentication } from '../application/service/RegisterTerminalAuthentication';
import { PullDataBaseRegisterTerminalUseCase } from '../application/usecase/PullDatabaseRegisterTerminalUseCase';

export class PullDatabaseRegisterTerminalController {
    constructor(
        private readonly registerTerminalAuthentication: RegisterTerminalAuthentication,
        private readonly pullDatabaseRegisterTerminalUseCase: PullDataBaseRegisterTerminalUseCase
    ) {}

    execute(
        input: PullDatabaseRegisterTerminalInput
    ): AppsScriptServerResponse<PullDatabaseRegisterTerminalOutput> {
        const parsedInput = pullDatabaseRegisterTerminalInput.safeParse(input);

        if (!parsedInput.success) {
            throw new InvalidArgumentError(
                'Invalid input',
                parsedInput.error.message
            );
        }

        this.registerTerminalAuthentication.execute(
            parsedInput.data.registerTerminalToken
        );

        return new AppsScriptServerResponse(
            this.pullDatabaseRegisterTerminalUseCase.execute()
        );
    }
}
