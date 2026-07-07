import {
    AppsScriptServerResponse,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    DeleteUserInput,
    deleteUserInputSchema,
    DeleteUserOutput,
} from '../../shared/api/user';
import { Authentication } from '../application/service/Authentication';
import { DeleteUserUseCase } from '../application/usecase/DeleteUserUseCase';

export class DeleteUserController {
    constructor(
        private readonly authentication: Authentication,
        private readonly deleteUserUseCase: DeleteUserUseCase
    ) {}
    execute({
        id,
        sessionToken,
    }: DeleteUserInput): AppsScriptServerResponse<DeleteUserOutput> {
        const input = deleteUserInputSchema.parse({ id, sessionToken });
        let userId: string;
        try {
            userId = this.authentication.execute(input.sessionToken);
        } catch {
            throw new UnauthorizedError();
        }
        const result = this.deleteUserUseCase.execute(userId, input.id);
        return new AppsScriptServerResponse({
            ok: result,
        });
    }
}
