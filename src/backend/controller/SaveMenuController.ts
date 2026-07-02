import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    SaveMenuRequest,
    SaveMenuResponse,
    saveMenuRequest,
} from '../../shared/api/menu';
import { Authentication } from '../application/service/Authentication';
import { SaveMenuUseCase } from '../application/usecase/SaveMenuUseCase';

export class SaveMenuController {
    constructor(
        private readonly authentication: Authentication,
        private readonly saveMenuUseCase: SaveMenuUseCase
    ) {}

    execute(
        input: SaveMenuRequest
    ): AppsScriptServerResponse<SaveMenuResponse> {
        const parsedInput = saveMenuRequest.safeParse(input);
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
        const result = this.saveMenuUseCase.execute(userId, parsedInput.data);
        return new AppsScriptServerResponse(result);
    }
}
