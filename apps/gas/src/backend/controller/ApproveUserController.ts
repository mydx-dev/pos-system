import {
    AppsScriptServerResponse,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    ApproveUserInput,
    approveUserInputSchema,
    ApproveUserOutput,
} from '../../shared/api/user';
import { Authentication } from '../application/service/Authentication';
import { ApproveUserUseCase } from '../application/usecase/ApproveUserUseCase';

export class ApproveUserController {
    constructor(
        private readonly authentication: Authentication,
        private readonly approveUserUseCase: ApproveUserUseCase
    ) {}
    execute(
        input: ApproveUserInput
    ): AppsScriptServerResponse<ApproveUserOutput> {
        const parsedInput = approveUserInputSchema.parse(input);
        let userId: string;
        try {
            userId = this.authentication.execute(parsedInput.sessionToken);
        } catch (error: Error | unknown) {
            throw new UnauthorizedError(
                error instanceof Error ? error.message : 'Authentication failed'
            );
        }
        const result = this.approveUserUseCase.execute(
            userId,
            parsedInput.user
        );
        return new AppsScriptServerResponse(result);
    }
}
