import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    UpdateUserInput,
    updateUserInputSchema,
    UpdateUserOutput,
} from '../../shared/api/user';
import { Authentication } from '../application/service/Authentication';
import { UpdateUserUseCase } from '../application/usecase/UpdateUserUseCase';

export class UpdateUserController {
    constructor(
        private readonly authentication: Authentication,
        private readonly updateUserUseCase: UpdateUserUseCase
    ) {}
    execute(
        input: UpdateUserInput
    ): AppsScriptServerResponse<UpdateUserOutput> {
        const parsedInput = updateUserInputSchema.safeParse(input);
        if (parsedInput.error) {
            throw new InvalidArgumentError(
                'ユーザー情報が不正です',
                parsedInput.error.message
            );
        }

        const userId = this.authentication.execute(
            parsedInput.data.sessionToken
        );
        if (!userId) {
            throw new UnauthorizedError();
        }

        const user = this.updateUserUseCase.execute(
            userId,
            parsedInput.data.user
        );
        return new AppsScriptServerResponse<UpdateUserOutput>({ user });
    }
}
