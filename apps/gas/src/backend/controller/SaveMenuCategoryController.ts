import {
    AppsScriptServerResponse,
    InvalidArgumentError,
    UnauthorizedError,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    SaveMenuCategoryRequest,
    SaveMenuCategoryResponse,
    saveMenuCategoryRequest,
} from '../../shared/api/menuCategory';
import { Authentication } from '../application/service/Authentication';
import { SaveMenuCategoryUseCase } from '../application/usecase/SaveMenuCategoryUseCase';

export class SaveMenuCategoryController {
    constructor(
        private readonly authentication: Authentication,
        private readonly saveMenuCategoryUseCase: SaveMenuCategoryUseCase
    ) {}
    execute(
        input: SaveMenuCategoryRequest
    ): AppsScriptServerResponse<SaveMenuCategoryResponse> {
        const parsedInput = saveMenuCategoryRequest.safeParse(input);
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
        const result = this.saveMenuCategoryUseCase.execute(
            userId,
            parsedInput.data
        );
        return new AppsScriptServerResponse(result);
    }
}
