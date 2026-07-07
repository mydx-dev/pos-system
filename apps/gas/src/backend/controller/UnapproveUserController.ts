import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    UnapproveUserInput,
    unapproveUserInputSchema,
    UnapproveUserOutput,
} from '../../shared/api/user';
import { Authentication } from '../application/service/Authentication';
import { UnapproveUserUseCase } from '../application/usecase/UnapproveUserUseCase';

export class UnapproveUserController {
    constructor(
        private readonly authentication: Authentication,
        private readonly unapproveUserUseCase: UnapproveUserUseCase
    ) {}
    execute(
        input: UnapproveUserInput
    ): AppsScriptServerResponse<UnapproveUserOutput> {
        const parsedInput = unapproveUserInputSchema.safeParse(input);
        if (!parsedInput.success) {
            throw new InvalidArgumentError('Invalid input');
        }
        let userId: string;
        try {
            userId = this.authentication.execute(parsedInput.data.sessionToken);
        } catch {
            throw new UnauthorizedError();
        }
        const updatedUser = this.unapproveUserUseCase.execute(
            userId,
            parsedInput.data.user
        );
        return new AppsScriptServerResponse({ user: updatedUser });
    }
}
